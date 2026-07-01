import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";
import { getCollections } from "./config/collections.js";
import { userRouter } from "./modules/user/user.router.js";
import { verifyToken } from "./middlewares/auth.js";


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

async function startServer() {
    try {
        await connectDB();
        const {
            usersCollection,
            restaurantUploadCollection,
            addFoodCollection,
            paymentCollection,
            districtCollection,
            reviewCollection,
            websiteReviewCollection,
            wishlistCollection,
        } = getCollections();

        app.use("/users", userRouter(usersCollection));
        app.use("/restaurantUpload", verifyToken, restaurantRouter(restaurantUploadCollection, addFoodCollection, paymentCollection, districtCollection, reviewCollection, websiteReviewCollection, wishlistCollection));

    } catch (error) {
        console.error("Error in server setup:", error.message);
    }
}
startServer();

app.get("/", (req, res) => {
    res.send("FOODHUB server is running");
});