import express from "express";
import { websiteReviewController } from "./websiteReview.controller.js";
import { verifyToken } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", websiteReviewController.getAllReviews);
router.post("/", verifyToken, websiteReviewController.addReview);

export const websiteReviewRouter = router;