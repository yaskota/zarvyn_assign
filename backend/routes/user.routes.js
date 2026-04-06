import express from "express";
import { getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { validateUserUpdate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(authMiddleware);


router.get("/", allowRoles("analyst", "admin"), getAllUsers);
router.get("/:id", allowRoles("analyst", "admin"), getUserById);
router.put("/:id", allowRoles("admin"), validateUserUpdate, updateUser);
router.delete("/:id", allowRoles("admin"), deleteUser);

export default router;
