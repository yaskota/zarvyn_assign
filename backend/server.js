import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
app.use(cookieParser());

dotenv.config();

connectDB();

const PORT=process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on the port ${PORT}`);
});