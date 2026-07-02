import { getCollections } from "../../config/collections.js";

const parseAmount = (value) => {
    if (typeof value === "string") {
        return parseFloat(value.replace(/[^0-9.-]/g, "")) || 0;
    }
    return Number(value) || 0;
};

const getRevenueSummary = async () => {
    const { paymentCollection } = getCollections();
    const payments = await paymentCollection.find({}).toArray();

    let totalRevenue = 0;
    let totalCommission = 0;
    let restaurantRevenue = 0;

    payments.forEach((payment) => {
        const amount = parseAmount(payment.foodPrice);
        const commission = amount * 0.05;

        totalRevenue += amount;
        totalCommission += commission;
        restaurantRevenue += amount - commission;
    });

    return {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders: payments.length,
        totalCommission: parseFloat(totalCommission.toFixed(2)),
        restaurantRevenue: parseFloat(restaurantRevenue.toFixed(2)),
        averageOrder: payments.length > 0 ? parseFloat((totalRevenue / payments.length).toFixed(2)) : 0,
    };
};

const getRevenueByMonth = async () => {
    const { paymentCollection } = getCollections();
    const payments = await paymentCollection.find({}).toArray();
    const monthly = {};

    payments.forEach((payment) => {
        const date = new Date(payment.date);
        const month = date.toLocaleString("default", { month: "short", year: "numeric" });

        if (!monthly[month]) {
            monthly[month] = { revenue: 0, commission: 0, restaurantRevenue: 0 };
        }

        const amount = parseAmount(payment.foodPrice);
        const commission = amount * 0.05;

        monthly[month].revenue += amount;
        monthly[month].commission += commission;
        monthly[month].restaurantRevenue += amount - commission;
    });

    return Object.entries(monthly).map(([month, data]) => ({
        month,
        revenue: parseFloat(data.revenue.toFixed(2)),
        commission: parseFloat(data.commission.toFixed(2)),
        restaurantRevenue: parseFloat(data.restaurantRevenue.toFixed(2)),
    }));
};

const getDailyRevenue = async () => {
    const { paymentCollection } = getCollections();
    const payments = await paymentCollection.find({}).toArray();
    const daily = {};

    payments.forEach((payment) => {
        const date = new Date(payment.date).toISOString().split("T")[0];
        const amount = parseAmount(payment.foodPrice);
        const commission = amount * 0.05;

        if (!daily[date]) {
            daily[date] = { revenue: 0, commission: 0, restaurantRevenue: 0 };
        }

        daily[date].revenue += amount;
        daily[date].commission += commission;
        daily[date].restaurantRevenue += amount - commission;
    });

    return Object.entries(daily)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .slice(0, 7)
        .reverse()
        .map(([date, data]) => ({
            date,
            revenue: parseFloat(data.revenue.toFixed(2)),
            commission: parseFloat(data.commission.toFixed(2)),
            restaurantRevenue: parseFloat(data.restaurantRevenue.toFixed(2)),
        }));
};

const getTopItems = async () => {
    const { paymentCollection } = getCollections();
    const payments = await paymentCollection.find({}).toArray();
    const itemMap = {};

    payments.forEach((payment) => {
        if (!Array.isArray(payment.items)) return;

        payment.items.forEach((item) => {
            const key = item.foodName;
            const quantity = parseInt(item.quantity) || 0;
            const price = parseAmount(item.price);

            if (!itemMap[key]) {
                itemMap[key] = {
                    foodName: item.foodName,
                    quantity: 0,
                    totalRevenue: 0,
                    restaurantRevenue: 0,
                    platformCommission: 0,
                    restaurantName: item.restaurantName,
                };
            }

            const itemTotal = price * quantity;
            const commission = itemTotal * 0.05;

            itemMap[key].quantity += quantity;
            itemMap[key].totalRevenue += itemTotal;
            itemMap[key].platformCommission += commission;
            itemMap[key].restaurantRevenue += itemTotal - commission;
        });
    });

    return Object.values(itemMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 6);
};

export const revenueService = {
    getRevenueSummary,
    getRevenueByMonth,
    getDailyRevenue,
    getTopItems,
};