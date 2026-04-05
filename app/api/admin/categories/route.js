import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import slugify from "slugify";

export const dynamic = "force-dynamic";

/* ================= GET CATEGORIES ================= */
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 });
  }
}

/* ================= CREATE CATEGORY ================= */
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.type) {
      return NextResponse.json({ success: false, message: "Name and type required" }, { status: 400 });
    }

    const exists = await Category.findOne({ name: new RegExp(`^${body.name}$`, "i") });
    if (exists) {
      return NextResponse.json({ success: false, message: "Category already exists" }, { status: 400 });
    }

    const category = await Category.create({
      name: body.name,
      type: body.type,
      active: true,
    });

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);
    return NextResponse.json({ success: false, message: "Failed to create category" }, { status: 500 });
  }
}

/* ================= UPDATE CATEGORY ================= */
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body._id) return NextResponse.json({ success: false, message: "Category ID required" }, { status: 400 });

    const category = await Category.findById(body._id);
    if (!category) return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

    category.name = body.name || category.name;
    category.type = body.type || category.type;
    category.active = body.active ?? category.active;

    await category.save();

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);
    return NextResponse.json({ success: false, message: "Failed to update category" }, { status: 500 });
  }
}
