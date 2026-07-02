import { ObjectId } from "mongodb";
import axios from "axios";
import Stripe from "stripe";
import emailjs from "emailjs-com";
import { getCollections } from "../../config/collections.js";
import { AppError } from "../../_shared/AppError.js";
import status from "http-status";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const parseAmount = (value) => {
    if (typeof value === "string") return parseFloat(value.replace(/[^0-9.-]/g, "")) || 0;
    return Number(value) || 0;
};

// ---- Orders / Revenue (restaurant-owner facing) ----

const getRestaurantRevenue = async (email) => {
    const { restaurantUploadCollection, paymentCollection } = getCollections();

    const restaurant = await restaurantUploadCollection.findOne({ email });
    if (!restaurant) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found for this owner");
    }

    const payments = await paymentCollection.find({
        "items.restaurantName": restaurant.restaurantName,
        status: "success",
    }).toArray();

    if (!payments.length) {
        return { todayEarnings: 0, monthlyEarnings: 0, totalBalance: 0, lastPayoutDate: null };
    }

    const calcEarnings = (filteredPayments) =>
        filteredPayments.reduce((sum, payment) => {
            const items = payment.items.filter((i) => i.restaurantName === restaurant.restaurantName);
            const total = items.reduce(
                (s, item) => s + parseAmount(item.price) * (parseInt(item.quantity) || 1),
                0
            );
            return sum + total * 0.95;
        }, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayEarnings = calcEarnings(payments.filter((p) => new Date(p.date) >= today));
    const monthlyEarnings = calcEarnings(payments.filter((p) => new Date(p.date) >= firstDayOfMonth));
    const totalBalance = calcEarnings(payments);

    const lastPayout = await paymentCollection.findOne(
        { "items.restaurantName": restaurant.restaurantName, status: "payout" },
        { sort: { date: -1 } }
    );

    return { todayEarnings, monthlyEarnings, totalBalance, lastPayoutDate: lastPayout?.date || null };
};

const getOrdersByRestaurant = async (restaurantName) => {
    if (!restaurantName) {
        throw new AppError(status.BAD_REQUEST, "Restaurant name is required");
    }
    const { paymentCollection } = getCollections();
    return await paymentCollection.find({ "items.restaurantName": restaurantName }).toArray();
};

// ---- SSL Commerce ----

const createSslPayment = async (paymentData) => {
    const { paymentCollection } = getCollections();

    if (!paymentData.foodPrice || !paymentData.email) {
        throw new AppError(status.BAD_REQUEST, "foodPrice and email are required");
    }

    const trxid = new ObjectId().toString();
    paymentData.transactionId = trxid;
    paymentData.status = "pending";

    const initiatePayment = {
        store_id: process.env.SSL_COMMERCE_SECRET_ID,
        store_passwd: process.env.SSL_COMMERCE_SECRET_PASS,
        total_amount: parseAmount(paymentData.foodPrice),
        currency: "BDT",
        tran_id: trxid,
        success_url: "http://localhost:5173/success-payment",
        fail_url: "http://localhost:5173/dashboard/fail",
        cancel_url: "http://localhost:5173/dashboard/cancel",
        ipn_url: "http://localhost:5173/ipn-success-payment",
        shipping_method: "Courier",
        product_name: paymentData.foodName || "Unknown",
        product_category: paymentData.category || "General",
        product_profile: "general",
        cus_name: paymentData.customerName || "Customer",
        cus_email: paymentData.email,
        cus_add1: paymentData.address || "Unknown Address",
        cus_city: paymentData.district || "Unknown City",
        cus_country: "Bangladesh",
        cus_phone: paymentData.contactNumber || "01700000000",
        ship_name: paymentData.customerName || "Customer",
        ship_add1: paymentData.address || "Unknown Address",
        ship_city: paymentData.district || "Unknown City",
        ship_country: "Bangladesh",
        ship_postcode: "4700",
    };

    let gatewayResponse;
    try {
        gatewayResponse = await axios.post(
            "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
            new URLSearchParams(initiatePayment).toString(),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
    } catch (err) {
        throw new AppError(status.BAD_GATEWAY, "Failed to initiate SSL Commerce payment");
    }

    await paymentCollection.insertOne(paymentData);

    const gatewayPageURL = gatewayResponse?.data?.GatewayPageURL;
    if (!gatewayPageURL) {
        throw new AppError(status.BAD_GATEWAY, "Payment gateway did not return a valid URL");
    }

    return { gatewayPageURL };
};

const verifySslPaymentAndComplete = async (val_id) => {
    const { paymentCollection, addFoodCollection } = getCollections();

    if (!val_id) {
        throw new AppError(status.BAD_REQUEST, "val_id is required");
    }

    const { data } = await axios.get(
        `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${process.env.SSL_COMMERCE_SECRET_ID}&store_passwd=${process.env.SSL_COMMERCE_SECRET_PASS}&format=json`
    );

    if (data.status !== "VALID") {
        throw new AppError(status.BAD_REQUEST, "Invalid payment");
    }

    await paymentCollection.updateOne({ transactionId: data.tran_id }, { $set: { status: "success" } });
    const payment = await paymentCollection.findOne({ transactionId: data.tran_id });

    if (!payment) {
        throw new AppError(status.NOT_FOUND, "Payment record not found");
    }

    if (Array.isArray(payment.items) && payment.items.length) {
        const query = { _id: { $in: payment.items.map((item) => new ObjectId(item.foodId)) } };
        await addFoodCollection.deleteMany(query);
    }

    // Send confirmation email — na thakle fail silently (email fail e main flow break kora uchit na)
    try {
        const templateParams = {
            to_email: payment.email,
            to_name: payment.customerName,
            payment_id: payment.transactionId,
            order_date: new Date(payment.date).toLocaleDateString(),
            total_amount: parseAmount(payment.foodPrice).toFixed(2),
            address: payment.address,
            upazila: payment.upazila,
            district: payment.district,
            division: payment.division,
            country: payment.country,
            contact_number: payment.contactNumber,
            items_html: (payment.items || [])
                .map(
                    (item) => `
                    <tr>
                        <td>${item.foodName}</td>
                        <td>${item.restaurantName}</td>
                        <td>${item.quantity}</td>
                        <td>$${(parseAmount(item.price) * item.quantity).toFixed(2)}</td>
                    </tr>`
                )
                .join(""),
        };

        await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            templateParams
        );
    } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError.message);
    }

    return true;
};

const sendPaymentEmail = async (emailData) => {
    const { to_email, to_name, transaction_id, order_date, total_amount, order_items, customer_address, customer_phone, restaurant_name } = emailData;

    if (!to_email || !transaction_id) {
        throw new AppError(status.BAD_REQUEST, "to_email and transaction_id are required");
    }

    const templateParams = {
        to_email,
        to_name,
        from_name: "FoodHub",
        transaction_id,
        order_date,
        total_amount,
        restaurant_name: restaurant_name || "FoodHub Restaurant",
        customer_address,
        customer_phone,
        order_items: Array.isArray(order_items) ? order_items.join("<br>") : order_items,
    };

    return await emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, templateParams);
};

// ---- Stripe ----

const createPaymentIntent = async (price) => {
    const amount = parseAmount(price);

    if (!amount || amount <= 0) {
        throw new AppError(status.BAD_REQUEST, "A valid price is required");
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        payment_method_types: ["card"],
    });

    return { clientSecret: paymentIntent.client_secret };
};

const createPayment = async (paymentData) => {
    const { paymentCollection, addFoodCollection } = getCollections();

    if (!paymentData.transactionId || !Array.isArray(paymentData.items) || paymentData.items.length === 0) {
        throw new AppError(status.BAD_REQUEST, "transactionId and non-empty items array are required");
    }

    // Verify actual Stripe payment status before trusting client input
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentData.transactionId).catch(() => null);
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
        throw new AppError(status.BAD_REQUEST, "Payment not verified with Stripe");
    }

    paymentData.status = "success";
    const paymentResult = await paymentCollection.insertOne(paymentData);

    const query = { _id: { $in: paymentData.items.map((item) => new ObjectId(item.foodId)) } };
    const deletedResult = await addFoodCollection.deleteMany(query);

    return { paymentResult, deletedResult };
};

// ---- Read / Delete payments ----

const getPaymentsByEmail = async (email) => {
    if (!email) {
        throw new AppError(status.BAD_REQUEST, "Email is required");
    }
    const { paymentCollection } = getCollections();
    return await paymentCollection.find({ email }).sort({ date: -1 }).toArray();
};

const getAllPayments = async () => {
    const { paymentCollection } = getCollections();
    return await paymentCollection.find({}).toArray();
};

const deletePayment = async (id) => {
    if (!ObjectId.isValid(id)) {
        throw new AppError(status.BAD_REQUEST, "Invalid payment ID");
    }
    const { paymentCollection } = getCollections();
    const result = await paymentCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        throw new AppError(status.NOT_FOUND, "Payment not found");
    }
    return result;
};
const getRestaurantPaymentsWithTotals = async (email) => {
    const { restaurantUploadCollection, paymentCollection } = getCollections();

    const restaurant = await restaurantUploadCollection.findOne({ email });
    if (!restaurant) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found for this owner");
    }

    const payments = await paymentCollection.find({
        "items.restaurantName": restaurant.restaurantName,
        status: "success",
    }).sort({ date: -1 }).toArray();

    const totals = payments.reduce((acc, payment) => {
        const restaurantItems = payment.items.filter(
            (item) => item.restaurantName === restaurant.restaurantName
        );
        const paymentTotal = restaurantItems.reduce(
            (sum, item) => sum + parseAmount(item.price) * (parseInt(item.quantity) || 1),
            0
        );
        const commission = paymentTotal * 0.05;
        const earnings = paymentTotal - commission;

        return {
            totalSales: acc.totalSales + paymentTotal,
            totalCommission: acc.totalCommission + commission,
            totalEarnings: acc.totalEarnings + earnings,
        };
    }, { totalSales: 0, totalCommission: 0, totalEarnings: 0 });

    return { data: payments, totals };
};
export const paymentService = {
    getRestaurantRevenue,
    getOrdersByRestaurant,
    createSslPayment,
    verifySslPaymentAndComplete,
    sendPaymentEmail,
    createPaymentIntent,
    createPayment,
    getPaymentsByEmail,
    getAllPayments,
    deletePayment,
    getRestaurantPaymentsWithTotals
};