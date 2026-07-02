import express from "express";
import { revenueController } from "./revenue.controller.js";
import { verifyToken, verifyAdmin } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/summary", verifyToken, verifyAdmin, revenueController.getRevenueSummary);
router.get("/by-month", verifyToken, verifyAdmin, revenueController.getRevenueByMonth);
router.get("/daily", verifyToken, verifyAdmin, revenueController.getDailyRevenue);
router.get("/top-items", verifyToken, verifyAdmin, revenueController.getTopItems);

export const revenueRouter = router;