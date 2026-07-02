import express from "express";
import { userController } from "./user.controller.js";
import { verifyToken, verifyAdmin, verifyModerator, verifyOwner, verifyRole } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyToken, verifyAdmin, userController.getAllUsers);
router.get("/check-name", userController.checkUserName);
router.put("/", userController.upsertUser);
router.delete("/:id", verifyToken, userController.deleteUser);
router.patch("/user/:id", verifyToken, userController.updateRoleToUser);
router.get("/admin/:email", verifyToken, verifyAdmin, userController.checkAdminStatus);
router.patch("/admin/:id", verifyToken, verifyRole("admin"), userController.makeUserAdmin);
router.get("/moderator/:email", verifyToken, verifyModerator, userController.checkModeratorStatus);
router.patch("/moderator/:id", verifyToken, verifyAdmin, userController.makeUserModerator);
router.get("/restaurantOwner/:email", verifyToken, verifyOwner, userController.checkOwnerStatus);
router.patch("/restaurantOwner/:id", verifyToken, verifyAdmin, userController.makeUserRestaurantOwner);
export const userRouter = router;