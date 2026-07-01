import express from "express";
import { restaurantController } from "./restaurant.controller.js";
import { verifyOwner, verifyToken } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", restaurantController.getAllRestaurants);
router.post("/", verifyToken, restaurantController.createRestaurant);

router.get("/district/:districtName", verifyToken, verifyOwner, restaurantController.getRestaurantsByDistrict);
router.get("/food-reviews", verifyToken, restaurantController.getFoodReviewsByQuery);
router.patch("/reply", verifyToken, restaurantController.addReplyToReview);

router.get("/:restaurantName", verifyToken, restaurantController.getRestaurantByName);
router.delete("/:restaurantName", verifyToken, verifyOwner, restaurantController.deleteRestaurant);

router.patch("/:restaurantName/food", verifyToken, restaurantController.addFoodToRestaurant);
router.patch("/:restaurantName/review", verifyToken, restaurantController.addRestaurantReview);
router.get("/:restaurantName/review/check", verifyToken, restaurantController.checkRestaurantReviewed);
router.get("/:restaurantName/review", verifyToken, restaurantController.getRestaurantReviews);

router.patch("/:restaurantName/:foodName/review", verifyToken, restaurantController.addFoodReview);
router.get("/:restaurantName/:foodName/reviews", verifyToken, restaurantController.getFoodReviewsByPath);

export const restaurantRouter = router;