import { getDB } from "./db.js";

export const getCollections = () => {
    const db = getDB();
    return {
        usersCollection: db.collection("users"),
        restaurantUploadCollection: db.collection("restaurantUpload"),
        addFoodCollection: db.collection("addFood"),
        paymentCollection: db.collection("payment"),
        districtCollection: db.collection("districtAvailable"),
        reviewCollection: db.collection("reviewAvailable"),
        websiteReviewCollection: db.collection("websiteReviews"),
        wishlistCollection: db.collection("wishlist"),
    };
};