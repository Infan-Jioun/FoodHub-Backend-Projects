import express from "express";
import { restaurantController } from "./restaurant.controller.js";
import { verifyOwner,} from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", restaurantController.getAllRestaurants);
router.post("/", restaurantController.createRestaurant);

router.get("/district/:districtName", verifyOwner, restaurantController.getRestaurantsByDistrict);
router.get("/food-reviews", restaurantController.getFoodReviewsByQuery);
router.patch("/reply", restaurantController.addReplyToReview);

router.get("/:restaurantName", restaurantController.getRestaurantByName);
router.delete("/:restaurantName", verifyOwner, restaurantController.deleteRestaurant);

router.patch("/:restaurantName/food", restaurantController.addFoodToRestaurant);
router.patch("/:restaurantName/review", restaurantController.addRestaurantReview);
router.get("/:restaurantName/review/check", restaurantController.checkRestaurantReviewed);
router.get("/:restaurantName/review", restaurantController.getRestaurantReviews);

router.patch("/:restaurantName/:foodName/review", restaurantController.addFoodReview);
router.get("/:restaurantName/:foodName/reviews", restaurantController.getFoodReviewsByPath);

export const restaurantRouter = router;