import express from "express";
import { revenueController } from "./revenue.controller.js";
import { verifyToken} from "../../middlewares/auth.js";

const router = express.Router();

router.get("/summary", verifyToken, revenueController.getRevenueSummary);
router.get("/by-month", verifyToken, revenueController.getRevenueByMonth);
router.get("/daily", verifyToken, revenueController.getDailyRevenue);
router.get("/top-items", verifyToken, revenueController.getTopItems);

export const revenueRouter = router;