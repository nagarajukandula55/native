import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Category from "@/models/Category";
import slugify from "slugify";

// Connect DB
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
}

// Admin auth
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const jwt = require("jsonwebtoken");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.role || decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

// GET categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST create or edit category
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    const { _id, name, type } = body;

    if (!name || !type) return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });

    const slug = slugify(name, { lower: true, strict: true });

    let category;
    if (_id) {
      category = await Category.findByIdAndUpdate(_id, { name, slug, type }, { new: true });
    } else {
      const exists = await Category.findOne({ slug });
      if (exists) return NextResponse.json({ success: false, message: "Category already exists" }, { status: 400 });
      category = await Category.create({ name, slug, type });
    }

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error(err);
    const status = err.message.includes("Unauthorized") ? 401 : err.message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status });
  }
}
