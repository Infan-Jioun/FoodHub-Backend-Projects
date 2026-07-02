import { getCollections } from "../../config/collections.js";
import { AppError } from "../../_shared/AppError.js";
import status from "http-status";

const getWishlistByEmail = async (email) => {
    if (!email) {
        throw new AppError(status.BAD_REQUEST, "Email is required");
    }
    const { wishlistCollection } = getCollections();
    return await wishlistCollection.find({ email }).toArray();
};

const addToWishlist = async (wishlistItem) => {
    const { wishlistCollection } = getCollections();

    if (!wishlistItem?.foodId || !wishlistItem?.email) {
        throw new AppError(status.BAD_REQUEST, "foodId and email are required");
    }

    const existing = await wishlistCollection.findOne({
        foodId: wishlistItem.foodId,
        email: wishlistItem.email,
    });

    if (existing) {
        throw new AppError(status.BAD_REQUEST, "Item already in wishlist");
    }

    return await wishlistCollection.insertOne(wishlistItem);
};

const removeFromWishlist = async (foodId, email) => {
    if (!foodId || !email) {
        throw new AppError(status.BAD_REQUEST, "foodId and email are required");
    }

    const { wishlistCollection } = getCollections();
    const result = await wishlistCollection.deleteOne({ foodId, email });

    if (result.deletedCount === 0) {
        throw new AppError(status.NOT_FOUND, "Wishlist item not found");
    }

    return result;
};

export const wishlistService = {
    getWishlistByEmail,
    addToWishlist,
    removeFromWishlist,
};