import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import jwt from "jsonwebtoken";
import slugify from "slugify";

export const dynamic = "force-dynamic";

/* ================= VERIFY ADMIN ================= */
async function verifyAdmin(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) throw new Error("Unauthorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") throw new Error("Forbidden");

    return decoded;
  } catch (err) {
    throw new Error(err.message || "Unauthorized");
  }
}

/* ================= GET ALL CATEGORIES ================= */
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
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
    await verifyAdmin(req);

    const body = await req.json();
    if (!body.name || !body.type) {
      return NextResponse.json({ success: false, message: "Name and type required" }, { status: 400 });
    }

    const slug = slugify(body.name, { lower: true, strict: true });

    // Check if exists
    const exists = await Category.findOne({ slug });
    if (exists) return NextResponse.json({ success: false, message: "Category already exists" }, { status: 400 });

    const category = await Category.create({
      name: body.name,
      slug,
      type: body.type, // 'website' or 'gst'
      gstOptions: body.gstOptions || [], // [{name, hsn, gst}]
      active: body.active ?? true,
    });

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}

/* ================= UPDATE CATEGORY ================= */
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    if (!body._id) return NextResponse.json({ success: false, message: "Category ID required" }, { status: 400 });

    const category = await Category.findById(body._id);
    if (!category) return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

    const slug = slugify(body.name, { lower: true, strict: true });

    Object.assign(category, {
      name: body.name,
      slug,
      type: body.type,
      gstOptions: body.gstOptions || category.gstOptions,
      active: body.active ?? category.active,
    });

    await category.save();
    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}

/* ================= DELETE CATEGORY ================= */
export async function DELETE(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "Category ID required" }, { status: 400 });

    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

    // Soft delete → toggle active
    category.active = false;
    await category.save();

    return NextResponse.json({ success: true, message: "Category deactivated" });
  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}
