import express from "express";
import { getDashboardSummary, getAnalytics } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);


router.get("/summary", allowRoles("viewer", "analyst", "admin"), getDashboardSummary);


router.get("/analytics", allowRoles("analyst", "admin"), getAnalytics);

export default router;
