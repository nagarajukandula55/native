import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import slugify from "slugify";

export const dynamic = "force-dynamic";

/* ================= DB CONNECT ================= */
async function dbConnect() {
  await connectDB();
}

/* ================= GET CATEGORIES ================= */
export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 });
  }
}

/* ================= ADD CATEGORY ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, message: "Category name is required" }, { status: 400 });
    }

    const slug = slugify(body.name, { lower: true, strict: true });

    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, message: "Category already exists" }, { status: 400 });
    }

    const category = await Category.create({
      name: body.name,
      slug,
    });

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("ADD CATEGORY ERROR:", err);
    return NextResponse.json({ success: false, message: "Failed to add category" }, { status: 500 });
  }
}
