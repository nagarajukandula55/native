import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const app = express();

app.use(helmet());
app.use(rateLimit({ windowMs: 15*60*1000, max: 200 }));
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log("MongoDB Connected"))
  .catch(err=>console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req,res)=>res.send("SaaS API Running"));

app.listen(process.env.PORT || 5000, ()=>console.log("Server Started"));