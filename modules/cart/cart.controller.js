import status from "http-status";
import { cartService } from "./cart.service.js";
import { catchAsync } from "../../_shared/catchAsync.js";
import { sendResponse } from "../../_shared/sendResponse.js";

const ok = (res, message, data, code = status.OK) =>
    sendResponse(res, { httpStatusCode: code, success: true, message, data, meta: null });

const getCartItemsByEmail = catchAsync(async (req, res) => {
    const result = await cartService.getCartItemsByEmail(req.query.email);
    ok(res, "Cart items retrieved successfully", result);
});

const addFoodToCart = catchAsync(async (req, res) => {
    const result = await cartService.addFoodToCart(req.body);
    ok(res, "Food item added successfully", result, status.CREATED);
});

const updateCartItemQuantity = catchAsync(async (req, res) => {
    const result = await cartService.updateCartItemQuantity(req.params.id, req.body.quantity);
    ok(res, "Quantity updated successfully", result);
});

const deleteCartItem = catchAsync(async (req, res) => {
    const result = await cartService.deleteCartItem(req.params.id);
    ok(res, "Cart item deleted successfully", result);
});

export const cartController = {
    getCartItemsByEmail,
    addFoodToCart,
    updateCartItemQuantity,
    deleteCartItem,
};