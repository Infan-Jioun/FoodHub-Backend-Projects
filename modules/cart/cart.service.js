import { ObjectId } from "mongodb";
import { getCollections } from "../../config/collections.js";
import { AppError } from "../../_shared/AppError.js";
import status from "http-status";

const getCartItemsByEmail = async (email) => {
    const { addFoodCollection } = getCollections();

    if (!email) {
        throw new AppError(status.BAD_REQUEST, "Email is required");
    }

    return await addFoodCollection.find({ email }).toArray();
};

const addFoodToCart = async (foodInfo) => {
    const { addFoodCollection } = getCollections();

    if (!foodInfo.foodName || !foodInfo.restaurantName || !foodInfo.email) {
        throw new AppError(status.BAD_REQUEST, "Missing required fields: foodName, restaurantName, email");
    }

    foodInfo.createdAt = new Date();

    const result = await addFoodCollection.insertOne(foodInfo);

    if (!result.insertedId) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to add food item");
    }

    return result;
};

const updateCartItemQuantity = async (id, quantity) => {
    const { addFoodCollection } = getCollections();

    if (!ObjectId.isValid(id)) {
        throw new AppError(status.BAD_REQUEST, "Invalid item ID");
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
        throw new AppError(status.BAD_REQUEST, "Quantity must be a valid positive number");
    }

    const result = await addFoodCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { quantity: parsedQuantity } }
    );

    if (result.matchedCount === 0) {
        throw new AppError(status.NOT_FOUND, "Cart item not found");
    }

    return result;
};

const deleteCartItem = async (id) => {
    const { addFoodCollection } = getCollections();

    if (!ObjectId.isValid(id)) {
        throw new AppError(status.BAD_REQUEST, "Invalid item ID");
    }

    const result = await addFoodCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        throw new AppError(status.NOT_FOUND, "Cart item not found");
    }

    return result;
};

export const cartService = {
    getCartItemsByEmail,
    addFoodToCart,
    updateCartItemQuantity,
    deleteCartItem,
};