import status from "http-status";
import { wishlistService } from "./wishlist.service.js";
import { catchAsync } from "../../_shared/catchAsync.js";
import { sendResponse } from "../../_shared/sendResponse.js";

const ok = (res, message, data, code = status.OK) =>
    sendResponse(res, { httpStatusCode: code, success: true, message, data, meta: null });

const getWishlistByEmail = catchAsync(async (req, res) => {
    const result = await wishlistService.getWishlistByEmail(req.query.email);
    ok(res, "Wishlist retrieved successfully", result);
});

const addToWishlist = catchAsync(async (req, res) => {
    const result = await wishlistService.addToWishlist(req.body);
    ok(res, "Item added to wishlist successfully", result, status.CREATED);
});

const removeFromWishlist = catchAsync(async (req, res) => {
    const result = await wishlistService.removeFromWishlist(req.params.foodId, req.query.email);
    ok(res, "Item removed from wishlist successfully", result);
});

export const wishlistController = {
    getWishlistByEmail,
    addToWishlist,
    removeFromWishlist,
};