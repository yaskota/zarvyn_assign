import express from "express";
import { getDashboardSummary, getAnalytics } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Viewer can see their own summary. Analyst/Admin can see any summary.
router.get("/summary", allowRoles("viewer", "analyst", "admin"), getDashboardSummary);

// Analytics heavily focused on Analyst/Admin
router.get("/analytics", allowRoles("analyst", "admin"), getAnalytics);

export default router;
