import express from "express";
import { authController } from "./auth.controller.js";

const router = express.Router();

router.post("/jwt", authController.generateToken);

export const authRouter = router;