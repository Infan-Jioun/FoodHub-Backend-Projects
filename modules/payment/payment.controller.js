import status from "http-status";
import { paymentService } from "./payment.service.js";
import { catchAsync } from "../../_shared/catchAsync.js";
import { sendResponse } from "../../_shared/sendResponse.js";

const ok = (res, message, data) =>
    sendResponse(res, { httpStatusCode: status.OK, success: true, message, data, meta: null });

const getRestaurantRevenue = catchAsync(async (req, res) => {
    const result = await paymentService.getRestaurantRevenue(req.params.email);
    ok(res, "Restaurant revenue retrieved successfully", result);
});

const getOrdersByRestaurant = catchAsync(async (req, res) => {
    const result = await paymentService.getOrdersByRestaurant(req.query.restaurantName);
    ok(res, "Orders retrieved successfully", result);
});

const createSslPayment = catchAsync(async (req, res) => {
    const result = await paymentService.createSslPayment(req.body);
    ok(res, "SSL payment initiated successfully", result);
});

const verifySslPaymentAndComplete = catchAsync(async (req, res) => {
    await paymentService.verifySslPaymentAndComplete(req.body.val_id);
    res.redirect("https://foodhub-d3e1e.web.app/dashboard/paymentHistory?status=success");
});

const sendPaymentEmail = catchAsync(async (req, res) => {
    const result = await paymentService.sendPaymentEmail(req.body);
    ok(res, "Email sent successfully", result);
});

const createPaymentIntent = catchAsync(async (req, res) => {
    const result = await paymentService.createPaymentIntent(req.body.price);
    ok(res, "Payment intent created successfully", result);
});

const createPayment = catchAsync(async (req, res) => {
    const result = await paymentService.createPayment(req.body);
    ok(res, "Payment recorded successfully", result);
});

const getPaymentsByEmail = catchAsync(async (req, res) => {
    const email = req.params.email || req.query.email;
    const result = await paymentService.getPaymentsByEmail(email);
    ok(res, "Payments retrieved successfully", result);
});

const getAllPayments = catchAsync(async (req, res) => {
    const result = await paymentService.getAllPayments();
    ok(res, "All payments retrieved successfully", result);
});

const deletePayment = catchAsync(async (req, res) => {
    const result = await paymentService.deletePayment(req.params.id);
    ok(res, "Payment deleted successfully", result);
});

export const paymentController = {
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
};