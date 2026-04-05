import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import slugify from "slugify";

export const dynamic = "force-dynamic";

/* ================= GET CATEGORIES ================= */
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

/* ================= CREATE CATEGORY ================= */
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, type } = body;

    if (!name) return NextResponse.json({ success: false, message: "Name required" }, { status: 400 });

    const slug = slugify(name, { lower: true, strict: true });
    const exists = await Category.findOne({ slug });
    if (exists) return NextResponse.json({ success: false, message: "Category already exists" }, { status: 400 });

    const category = await Category.create({ name, type, slug, active: true });
    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to create category" }, { status: 500 });
  }
}
