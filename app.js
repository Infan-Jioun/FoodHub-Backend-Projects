import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { getCollections } from "./config/collections.js";
import { userRouter } from "./modules/user/user.router.js";
import { verifyToken } from "./middlewares/auth.js";
import { connectDB } from "./config/db.js";
import { restaurantRouter } from "./modules/restaurant/restaurant.router.js";
import { cartRouter } from "./modules/cart/cart.router.js";
import { revenueRouter } from "./modules/revenue/revenue.router.js";
import { paymentRouter } from "./modules/payment/payment.router.js";
import { districtRouter } from "./modules/district/district.router.js";
import { wishlistRouter } from "./modules/wishlist/wishlist.router.js";
import { websiteReviewRouter } from "./modules/websiteReview/websiteReview.router.js";
import { authRouter } from "./modules/auth/auth.router.js";


export const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://foodhub-d3e1e.web.app',
        'https://foodhub-d3e1e.firebaseapp.com'
    ]
}));
app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }))
async function startServer() {
    try {
        await connectDB();

        app.use("/", authRouter);
        app.use("/users", userRouter);
        app.use("/districts", districtRouter);
        app.use("/restaurant", restaurantRouter);
        app.use("/wishlist", wishlistRouter);
        app.use("/cart", cartRouter);
        app.use("/payments", paymentRouter);
        app.use("/revenue", revenueRouter);
        app.use("/website-reviews", websiteReviewRouter);


    } catch (error) {
        console.error("Error in server setup:", error.message);
    }
}
startServer();

app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "FOODHUB server is running",
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    console.error(error.message);
    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
});