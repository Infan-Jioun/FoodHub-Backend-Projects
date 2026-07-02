import { ObjectId } from "mongodb";
import { getCollections } from "../../config/collections.js";
import { AppError } from "../../_shared/AppError.js";
import status from "http-status";

const getAllRestaurants = async () => {
    const { restaurantUploadCollection } = getCollections();
    return await restaurantUploadCollection.find().toArray();
};

const checkRestaurantExists = async (email, restaurantName) => {
    const { restaurantUploadCollection } = getCollections();
    const exists = await restaurantUploadCollection.findOne({ email, restaurantName });
    return { exists: !!exists };
};

const createRestaurant = async (data) => {
    const { restaurantUploadCollection } = getCollections();
    const { email, restaurantName } = data;

    if (!email || !restaurantName) {
        throw new AppError(status.BAD_REQUEST, "email and restaurantName are required");
    }

    const existing = await restaurantUploadCollection.findOne({ email, restaurantName });
    if (existing) {
        throw new AppError(status.CONFLICT, "Restaurant already exists for this user.");
    }

    return await restaurantUploadCollection.insertOne(data);
};

const getRestaurantByName = async (restaurantName) => {
    const { restaurantUploadCollection } = getCollections();
    const result = await restaurantUploadCollection.findOne({ restaurantName });

    if (!result) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found");
    }
    return result;
};

const getRestaurantsByDistrict = async (districtName) => {
    const { restaurantUploadCollection } = getCollections();
    return await restaurantUploadCollection.find({ districtName }).toArray();
};

const deleteRestaurant = async (restaurantName) => {
    const { restaurantUploadCollection } = getCollections();
    const result = await restaurantUploadCollection.deleteOne({ restaurantName });

    if (result.deletedCount === 0) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found");
    }
    return result;
};

const addFoodToRestaurant = async (restaurantName, foodInfo) => {
    const { restaurantUploadCollection } = getCollections();

    if (!foodInfo?.foodName) {
        throw new AppError(status.BAD_REQUEST, "foodName is required");
    }

    const filter = { restaurantName: decodeURIComponent(restaurantName) };
    const result = await restaurantUploadCollection.updateOne(filter, { $push: { foods: foodInfo } });

    if (result.matchedCount === 0) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found. Please create it first.");
    }
    if (result.modifiedCount === 0) {
        throw new AppError(status.BAD_REQUEST, "Food was not added. Check your data.");
    }
    return result;
};

const addRestaurantReview = async (restaurantName, reviewData) => {
    const { restaurantUploadCollection } = getCollections();
    const { email, name, rating, comment, date, userImage } = reviewData;

    if (!email || !rating || !comment) {
        throw new AppError(status.BAD_REQUEST, "email, rating and comment are required");
    }

    const filter = { restaurantName };
    const restaurant = await restaurantUploadCollection.findOne(filter);

    if (!restaurant) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found");
    }

    const alreadyReviewed = restaurant.reviews?.some((r) => r.email === email);
    if (alreadyReviewed) {
        throw new AppError(status.BAD_REQUEST, "Already reviewed");
    }

    const newReview = {
        _id: new ObjectId(),
        name,
        email,
        rating,
        comment,
        date: new Date(date),
        userImage: userImage || null,
    };

    const result = await restaurantUploadCollection.updateOne(filter, { $push: { reviews: newReview } });
    return { modified: result.modifiedCount > 0, review: newReview };
};

const checkRestaurantReviewed = async (restaurantName, email) => {
    const { restaurantUploadCollection } = getCollections();
    const found = await restaurantUploadCollection.findOne({
        restaurantName,
        "reviews.email": email,
    });
    return { reviewed: !!found };
};

const getRestaurantReviews = async (restaurantName) => {
    const { restaurantUploadCollection } = getCollections();

    if (!restaurantName) {
        throw new AppError(status.BAD_REQUEST, "Restaurant name required");
    }

    const found = await restaurantUploadCollection.findOne(
        { restaurantName },
        { projection: { reviews: 1 } }
    );

    if (!found) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found");
    }

    return (found.reviews || []).map((r) => ({
        ...r,
        rating: r.rating?.$numberInt ? parseInt(r.rating.$numberInt) : r.rating,
    }));
};

const addFoodReview = async (restaurantName, foodName, reviewData) => {
    const { restaurantUploadCollection } = getCollections();

    if (!reviewData?.customerEmail) {
        throw new AppError(status.BAD_REQUEST, "customerEmail is required");
    }

    const filter = { restaurantName: decodeURIComponent(restaurantName) };
    const restaurantDoc = await restaurantUploadCollection.findOne(filter);

    if (!restaurantDoc) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found");
    }

    const targetFood = restaurantDoc.foods.find(
        (food) => food.foodName === decodeURIComponent(foodName)
    );

    if (!targetFood) {
        throw new AppError(status.NOT_FOUND, "Food not found");
    }

    const alreadyReviewed = targetFood.reviews?.some(
        (review) => review.customerEmail === reviewData.customerEmail
    );

    if (alreadyReviewed) {
        throw new AppError(status.BAD_REQUEST, "Already reviewed");
    }

    reviewData._id = new ObjectId();
    reviewData.date = new Date();

    const result = await restaurantUploadCollection.updateOne(
        {
            restaurantName: decodeURIComponent(restaurantName),
            "foods.foodName": decodeURIComponent(foodName),
        },
        { $push: { "foods.$.reviews": reviewData } }
    );

    return { modified: result.modifiedCount > 0 };
};

const getFoodReviewsByPath = async (restaurantName, foodName) => {
    const { restaurantUploadCollection } = getCollections();
    const filter = { restaurantName: decodeURIComponent(restaurantName) };
    const restaurantDoc = await restaurantUploadCollection.findOne(filter);

    if (!restaurantDoc) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found");
    }

    const targetFood = restaurantDoc.foods.find(
        (food) => food.foodName === decodeURIComponent(foodName)
    );

    if (!targetFood) {
        throw new AppError(status.NOT_FOUND, "Food not found");
    }

    return targetFood.reviews || [];
};

const addReplyToReview = async ({ restaurantName, foodName, reviewId, reply }) => {
    const { restaurantUploadCollection } = getCollections();

    if (!ObjectId.isValid(reviewId)) {
        throw new AppError(status.BAD_REQUEST, "Invalid review ID");
    }

    const result = await restaurantUploadCollection.updateOne(
        {
            restaurantName,
            "foods.foodName": foodName,
            "foods.reviews._id": new ObjectId(reviewId),
        },
        {
            $set: {
                "foods.$[food].reviews.$[review].reply": reply,
                "foods.$[food].reviews.$[review].replyDate": new Date(),
            },
        },
        {
            arrayFilters: [
                { "food.foodName": foodName },
                { "review._id": new ObjectId(reviewId) },
            ],
        }
    );

    return { modified: result.modifiedCount > 0 };
};

const getFoodReviewsByQuery = async (restaurantName, foodName) => {
    const { restaurantUploadCollection } = getCollections();
    const restaurant = await restaurantUploadCollection.findOne({
        restaurantName,
        "foods.foodName": foodName,
    });

    if (!restaurant) {
        return { reviews: [] };
    }

    const foodItem = restaurant.foods.find((f) => f.foodName === foodName);
    return { reviews: foodItem.reviews || [] };
};
const getRestaurantByEmail = async (email) => {
    const { restaurantUploadCollection } = getCollections();

    if (!email) {
        throw new AppError(status.BAD_REQUEST, "Email is required");
    }

    const restaurant = await restaurantUploadCollection.findOne({ email });

    if (!restaurant) {
        throw new AppError(status.NOT_FOUND, "Restaurant not found for this email");
    }

    return restaurant;
};
const deleteFoodFromRestaurant = async (restaurantName, foodName) => {
    const { restaurantUploadCollection } = getCollections();

    const filter = { restaurantName };
    const update = { $pull: { foods: { foodName } } };

    const result = await restaurantUploadCollection.updateOne(filter, update);

    if (result.modifiedCount === 0) {
        throw new AppError(status.NOT_FOUND, "Food item not found");
    }

    return result;
};
export const restaurantService = {
    getAllRestaurants,
    checkRestaurantExists,
    createRestaurant,
    getRestaurantByName,
    getRestaurantsByDistrict,
    deleteRestaurant,
    addFoodToRestaurant,
    addRestaurantReview,
    checkRestaurantReviewed,
    getRestaurantReviews,
    addFoodReview,
    getFoodReviewsByPath,
    addReplyToReview,
    getFoodReviewsByQuery,
    getRestaurantByEmail,
    deleteFoodFromRestaurant
};