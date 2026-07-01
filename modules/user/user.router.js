import express from "express";
import { userController } from "./user.controller.js";

const router = express.Router();
router.get("/", userController.getAllUsers);
export const userRouter = router;