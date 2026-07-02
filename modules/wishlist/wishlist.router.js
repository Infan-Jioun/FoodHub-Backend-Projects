import express from "express";
import { wishlistController } from "./wishlist.controller.js";
import { verifyToken } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyToken, wishlistController.getWishlistByEmail);
router.post("/", verifyToken, wishlistController.addToWishlist);
router.delete("/:foodId", verifyToken, wishlistController.removeFromWishlist);

export const wishlistRouter = router;