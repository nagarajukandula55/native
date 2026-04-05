import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import slugify from "slugify";

export const dynamic = "force-dynamic";

/* ================= EDIT CATEGORY ================= */
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { name, type } = body;

    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

    category.name = name || category.name;
    category.type = type || category.type;
    category.slug = slugify(name, { lower: true, strict: true });
    await category.save();

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to update category" }, { status: 500 });
  }
}

/* ================= TOGGLE STATUS ================= */
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { active } = await req.json();

    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });

    category.active = active;
    await category.save();
    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to update status" }, { status: 500 });
  }
}
