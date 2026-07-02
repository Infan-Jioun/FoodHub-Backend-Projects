import express from "express";
import { restaurantController } from "./restaurant.controller.js";
import { verifyOwner, verifyToken, } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", restaurantController.getAllRestaurants);
router.post("/", verifyToken, verifyOwner, restaurantController.createRestaurant);

router.get("/district/:districtName", restaurantController.getRestaurantsByDistrict);
router.get("/food-reviews", restaurantController.getFoodReviewsByQuery);
router.patch("/reply", verifyToken, verifyOwner, restaurantController.addReplyToReview);

router.get("/:restaurantName", restaurantController.getRestaurantByName);
router.delete("/:restaurantName", verifyToken, verifyOwner, restaurantController.deleteRestaurant);

router.patch("/:restaurantName/food", verifyToken, verifyOwner, restaurantController.addFoodToRestaurant);
router.patch("/:restaurantName/review", verifyToken, verifyOwner, restaurantController.addRestaurantReview);
router.get("/:restaurantName/review/check", restaurantController.checkRestaurantReviewed);
router.get("/:restaurantName/review", restaurantController.getRestaurantReviews);

router.patch("/:restaurantName/:foodName/review", verifyToken, verifyOwner, restaurantController.addFoodReview);
router.get("/:restaurantName/:foodName/reviews", restaurantController.getFoodReviewsByPath);
router.get("/by-email/:email", verifyToken, verifyOwner, restaurantController.getRestaurantByEmail);
router.delete("/:restaurantName/food/:foodName", verifyToken, verifyOwner, restaurantController.deleteFoodFromRestaurant);
router.put("/:restaurantName/food/:foodName", verifyToken, verifyOwner, restaurantController.updateFoodInRestaurant);
export const restaurantRouter = router;