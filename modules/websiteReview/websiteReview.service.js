import { getCollections } from "../../config/collections.js";
import { AppError } from "../../_shared/AppError.js";
import status from "http-status";

const getAllReviews = async () => {
    const { websiteReviewCollection } = getCollections();
    return await websiteReviewCollection.find({}).sort({ date: -1 }).toArray();  direct
};

const addReview = async (reviewData) => {
    const { websiteReviewCollection } = getCollections();
    const { email, name, photoURL, rating, comment, date } = reviewData;

    if (!email || !rating || !comment) {
        throw new AppError(status.BAD_REQUEST, "email, rating and comment are required");
    }

    const existing = await websiteReviewCollection.findOne({ email });
    if (existing) {
        throw new AppError(status.BAD_REQUEST, "You have already reviewed");
    }

    const result = await websiteReviewCollection.insertOne({
        email,
        name,
        photoURL,
        rating,
        comment,
        date: date || new Date(),
    });

    return { reviewId: result.insertedId };
};

const getReviewByEmail = async (email) => {
    if (!email) {
        throw new AppError(status.BAD_REQUEST, "Email is required");
    }
    const { websiteReviewCollection } = getCollections();
    const review = await websiteReviewCollection.findOne({ email });
    return { review: review || null };
};
export const websiteReviewService = {
    getAllReviews,
    addReview,
    getReviewByEmail
};