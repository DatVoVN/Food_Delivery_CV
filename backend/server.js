import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import dotenv from "dotenv";
dotenv.config();
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
const app = express();
const port = 4000;
// MIDDLEWARE
app.use(cors());
app.use(express.json());

// DATABASE
connectDB();
// API ENDPOINTS
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
// SERVER
app.get("/", (req, res) => {
  res.send("API");
});
app.listen(port, () => {
  console.log(`App running on port ${port} at http://localhost:${port}`);
});
