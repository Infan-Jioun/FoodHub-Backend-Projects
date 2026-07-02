import express from "express";
import { restaurantController } from "./restaurant.controller.js";
import { verifyOwner, verifyToken, } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", restaurantController.getAllRestaurants);
router.post("/", restaurantController.createRestaurant);

router.get("/district/:districtName", restaurantController.getRestaurantsByDistrict);
router.get("/food-reviews", restaurantController.getFoodReviewsByQuery);
router.patch("/reply", restaurantController.addReplyToReview);

router.get("/:restaurantName", restaurantController.getRestaurantByName);
router.delete("/:restaurantName", restaurantController.deleteRestaurant);

router.patch("/:restaurantName/food", restaurantController.addFoodToRestaurant);
router.patch("/:restaurantName/review", restaurantController.addRestaurantReview);
router.get("/:restaurantName/review/check", restaurantController.checkRestaurantReviewed);
router.get("/:restaurantName/review", restaurantController.getRestaurantReviews);

router.patch("/:restaurantName/:foodName/review", restaurantController.addFoodReview);
router.get("/:restaurantName/:foodName/reviews", restaurantController.getFoodReviewsByPath);
router.get("/by-email/:email", restaurantController.getRestaurantByEmail);
router.delete("/:restaurantName/food/:foodName", verifyToken, restaurantController.deleteFoodFromRestaurant);
export const restaurantRouter = router;