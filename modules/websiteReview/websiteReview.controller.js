import status from "http-status";
import { websiteReviewService } from "./websiteReview.service.js";
import { catchAsync } from "../../_shared/catchAsync.js";
import { sendResponse } from "../../_shared/sendResponse.js";

const ok = (res, message, data, code = status.OK) =>
    sendResponse(res, { httpStatusCode: code, success: true, message, data, meta: null });

const getAllReviews = catchAsync(async (req, res) => {
    const result = await websiteReviewService.getAllReviews();
    ok(res, "Reviews retrieved successfully", result);
});

const addReview = catchAsync(async (req, res) => {
    const result = await websiteReviewService.addReview(req.body);
    ok(res, "Review submitted successfully", result, status.CREATED);
});
const getReviewByEmail = catchAsync(async (req, res) => {
    const result = await websiteReviewService.getReviewByEmail(req.query.email);
    ok(res, "Review retrieved successfully", result);
});
export const websiteReviewController = {
    getAllReviews,
    addReview,
    getReviewByEmail,
};