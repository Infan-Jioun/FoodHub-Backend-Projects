import express from "express";
import { paymentController } from "./payment.controller.js";
import { verifyToken, verifyOwner, verifyAdmin } from "../../middlewares/auth.js";

const router = express.Router();

// Restaurant-owner facing
router.get("/revenue/:email", verifyToken, verifyOwner, paymentController.getRestaurantRevenue);
router.get("/orders", verifyToken, verifyOwner, paymentController.getOrdersByRestaurant);

// SSL Commerce
router.post("/ssl/create", verifyToken, paymentController.createSslPayment);
router.post("/ssl/success", paymentController.verifySslPaymentAndComplete); // SSLCommerz callback, token thakbe na

// Email
router.post("/send-email", verifyToken, paymentController.sendPaymentEmail);

// Stripe
router.post("/create-payment-intent", verifyToken, paymentController.createPaymentIntent);
router.post("/", verifyToken, paymentController.createPayment);

// Read / delete
router.get("/email/:email", verifyToken, paymentController.getPaymentsByEmail);
router.get("/", verifyToken, paymentController.getAllPayments);
router.delete("/:id", verifyToken, verifyAdmin, paymentController.deletePayment);

export const paymentRouter = router;