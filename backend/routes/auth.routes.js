import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validateAuth } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post("/register", validateAuth, register);
router.post("/login", validateAuth, login);

export default router;