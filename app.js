import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { getCollections } from "./config/collections.js";
import { userRouter } from "./modules/user/user.router.js";
import { verifyToken } from "./middlewares/auth.js";
import { connectDB } from "./config/db.js";
import { restaurantRouter } from "./modules/restaurant/restaurant.router.js";


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


        app.use("/users", userRouter);
        app.use("/restaurant", restaurantRouter);

    } catch (error) {
        console.error("Error in server setup:", error.message);
    }
}
startServer();

app.get("/", (req, res) => {
    res.send("FOODHUB server is running");
});
app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    console.error(error.message);
    res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
});