import express from "express";
import { getAllUsers, getUserById } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Only analysts and admins can access user lists
router.get("/", allowRoles("analyst", "admin"), getAllUsers);
router.get("/:id", allowRoles("analyst", "admin"), getUserById);

export default router;
