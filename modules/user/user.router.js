import express from "express";
const router = express.Router();
router.get("/", getAllUsers)
export const userRouter = router;