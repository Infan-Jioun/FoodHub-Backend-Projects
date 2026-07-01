import express from "express";
import { cartController } from "./cart.controller.js";
import { verifyToken } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyToken, cartController.getCartItemsByEmail);
router.post("/", verifyToken, cartController.addFoodToCart);
router.patch("/:id", verifyToken, cartController.updateCartItemQuantity);
router.delete("/:id", verifyToken, cartController.deleteCartItem);

export const cartRouter = router;