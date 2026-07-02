import status from "http-status";
import { restaurantService } from "./restaurant.service.js";
import { catchAsync } from "../../_shared/catchAsync.js";
import { sendResponse } from "../../_shared/sendResponse.js";

const ok = (res, message, data) =>
    sendResponse(res, { httpStatusCode: status.OK, success: true, message, data, meta: null });

const getAllRestaurants = catchAsync(async (req, res) => {
    const { email, restaurantName } = req.query;

    if (email && restaurantName) {
        const result = await restaurantService.checkRestaurantExists(email, restaurantName);
        return ok(res, "Restaurant existence checked", result);
    }

    const result = await restaurantService.getAllRestaurants();
    ok(res, "Restaurants retrieved successfully", result);
});

const createRestaurant = catchAsync(async (req, res) => {
    const result = await restaurantService.createRestaurant(req.body);
    ok(res, "Restaurant created successfully", result);
});

const getRestaurantByName = catchAsync(async (req, res) => {
    const result = await restaurantService.getRestaurantByName(req.params.restaurantName);
    ok(res, "Restaurant retrieved successfully", result);
});

const getRestaurantsByDistrict = catchAsync(async (req, res) => {
    const result = await restaurantService.getRestaurantsByDistrict(req.params.districtName);
    ok(res, "Restaurants retrieved by district successfully", result);
});

const deleteRestaurant = catchAsync(async (req, res) => {
    const result = await restaurantService.deleteRestaurant(req.params.restaurantName);
    ok(res, "Restaurant deleted successfully", result);
});

const addFoodToRestaurant = catchAsync(async (req, res) => {
    const result = await restaurantService.addFoodToRestaurant(req.params.restaurantName, req.body);
    ok(res, "Food added successfully", result);
});

const addRestaurantReview = catchAsync(async (req, res) => {
    const result = await restaurantService.addRestaurantReview(req.params.restaurantName, req.body);
    ok(res, "Review added successfully", result);
});

const checkRestaurantReviewed = catchAsync(async (req, res) => {
    const { email } = req.query;
    const result = await restaurantService.checkRestaurantReviewed(req.params.restaurantName, email);
    ok(res, "Review status checked", result);
});

const getRestaurantReviews = catchAsync(async (req, res) => {
    const result = await restaurantService.getRestaurantReviews(req.params.restaurantName);
    ok(res, "Reviews retrieved successfully", result);
});

const addFoodReview = catchAsync(async (req, res) => {
    const { restaurantName, foodName } = req.params;
    const result = await restaurantService.addFoodReview(restaurantName, foodName, req.body.reviewData);
    ok(res, "Food review added successfully", result);
});

const getFoodReviewsByPath = catchAsync(async (req, res) => {
    const { restaurantName, foodName } = req.params;
    const result = await restaurantService.getFoodReviewsByPath(restaurantName, foodName);
    ok(res, "Food reviews retrieved successfully", result);
});

const addReplyToReview = catchAsync(async (req, res) => {
    const result = await restaurantService.addReplyToReview(req.body);
    ok(res, "Reply added successfully", result);
});

const getFoodReviewsByQuery = catchAsync(async (req, res) => {
    const { restaurantName, foodName } = req.query;
    const result = await restaurantService.getFoodReviewsByQuery(restaurantName, foodName);
    ok(res, "Food reviews retrieved successfully", result);
});
const getRestaurantByEmail = catchAsync(async (req, res) => {
    const result = await restaurantService.getRestaurantByEmail(req.params.email);
    ok(res, "Restaurant retrieved successfully", result);
});
const deleteFoodFromRestaurant = catchAsync(async (req, res) => {
    const { restaurantName, foodName } = req.params;
    const result = await restaurantService.deleteFoodFromRestaurant(restaurantName, foodName);
    ok(res, "Food item deleted successfully", result);
});
export const restaurantController = {
    getAllRestaurants,
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