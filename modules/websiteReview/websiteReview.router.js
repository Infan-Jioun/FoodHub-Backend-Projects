import express from "express";
import { websiteReviewController } from "./websiteReview.controller.js";
import { verifyToken } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", websiteReviewController.getAllReviews);
router.post("/", verifyToken, websiteReviewController.addReview);
router.get("/mine", verifyToken, websiteReviewController.getReviewByEmail)
export const websiteReviewRouter = router;