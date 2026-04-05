import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import jwt from "jsonwebtoken";

/* ================= AUTH ================= */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.role || decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET ================= */
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}

/* ================= POST ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { name } = await req.json();
    if (!name) return NextResponse.json({ success: false, message: "Name required" }, { status: 400 });

    const exists = await Category.findOne({ name });
    if (exists) return NextResponse.json({ success: false, message: "Category already exists" }, { status: 400 });

    const category = await Category.create({ name });
    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}

/* ================= PUT ================= */
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { categoryId, name } = await req.json();
    if (!categoryId || !name) return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });

    const category = await Category.findById(categoryId);
    if (!category) return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

    category.name = name;
    await category.save();

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}

/* ================= DELETE ================= */
export async function DELETE(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    if (!categoryId) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    await Category.findByIdAndDelete(categoryId);
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}
