import express from "express";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "../controllers/transaction.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// All roles can view and create
router.get("/", allowRoles("viewer", "analyst", "admin"), getTransactions);
router.post("/", allowRoles("viewer", "analyst", "admin"), createTransaction);

// Update/Delete (handled within controller logic to ensure owner or admin rights)
router.put("/:id", allowRoles("viewer", "analyst", "admin"), updateTransaction);
router.delete("/:id", allowRoles("viewer", "analyst", "admin"), deleteTransaction);

export default router;