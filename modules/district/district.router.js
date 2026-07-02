import express from "express";
import { districtController } from "./district.controller.js";
import { verifyToken, verifyAdmin } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", districtController.getAllDistricts);
router.post("/", verifyToken, verifyAdmin, districtController.addDistrict);

export const districtRouter = router;