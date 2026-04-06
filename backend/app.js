import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import userRoutes from "./routes/user.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { sanitizeData } from "./middleware/validate.middleware.js";

dotenv.config();

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.json());


app.use(sanitizeData);


app.use("/api/auth", authRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running", timestamp: new Date() });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

export default app;