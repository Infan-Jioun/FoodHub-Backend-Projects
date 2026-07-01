import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";
import { getCollections } from "./config/collections.js";


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

        app.use("/users", createUserRouter(usersCollection));
        app.use("/restaurantUpload", createRestaurantRouter(restaurantUploadCollection));
        app.use("/addFood", createAddFoodRouter(addFoodCollection));
        app.use("/payment", createPaymentRouter(paymentCollection));
        app.use("/district", createDistrictRouter(districtCollection));
        app.use("/review", createReviewRouter(reviewCollection));
        app.use("/websiteReview", createWebsiteReviewRouter(websiteReviewCollection));
        app.use("/wishlist", createWishlistRouter(wishlistCollection));

    } catch (error) {
        console.error("Error in server setup:", error.message);
    }
}
startServer();

app.get("/", (req, res) => {
    res.send("FOODHUB server is running");
});