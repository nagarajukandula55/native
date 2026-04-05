import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import jwt from "jsonwebtoken";

/* ================= AUTH ================= */
function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET ================= */
export async function GET(req) {
  await connectDB();
  verifyAdmin(req);

  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  return NextResponse.json({ success: true, categories });
}

/* ================= POST ================= */
export async function POST(req) {
  await connectDB();
  verifyAdmin(req);

  const { name } = await req.json();

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const category = await Category.create({ name, slug });

  return NextResponse.json({ success: true, category });
}
