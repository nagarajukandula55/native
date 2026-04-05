import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import jwt from "jsonwebtoken";
import slugify from "slugify";

export const dynamic = "force-dynamic";

/* ================= AUTH ================= */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.role || decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET CATEGORIES ================= */
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

/* ================= CREATE CATEGORY ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    if (!body.name) return NextResponse.json({ success: false, message: "Name required" }, { status: 400 });

    const slug = slugify(body.name, { lower: true, strict: true });

    const existing = await Category.findOne({ slug });
    if (existing) return NextResponse.json({ success: false, message: "Category already exists" }, { status: 400 });

    const category = await Category.create({ ...body, slug });

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);
    const status = err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status });
  }
}
