import express from "express";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "../controllers/transaction.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { validateTransaction } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(authMiddleware);


router.get("/", allowRoles("viewer", "analyst", "admin"), getTransactions);
router.post("/", allowRoles("viewer", "analyst", "admin"), validateTransaction, createTransaction);


router.put("/:id", allowRoles("viewer", "analyst", "admin"), validateTransaction, updateTransaction);
router.delete("/:id", allowRoles("viewer", "analyst", "admin"), deleteTransaction);

export default router;