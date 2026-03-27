// app/api/branding/labels/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Label from "@/models/Label";

/* ================= GET ALL LABELS ================= */
export async function GET() {
  try {
    await connectDB();
    const labels = await Label.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, labels });
  } catch (error) {
    return NextResponse.json({ success: false, msg: error.message }, { status: 500 });
  }
}

/* ================= CREATE NEW LABEL ================= */
export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // 🔹 AUTO GENERATE SKU
    if (!data.sku) {
      const ts = Date.now().toString().slice(-5);
      const namePart = data.name ? data.name.replace(/\s+/g, "").toUpperCase().slice(0, 3) : "LBL";
      data.sku = `${namePart}-${ts}`;
    }

    // 🔹 AUTO PRICE SUGGESTION
    if (!data.price) {
      let base = 50; // default base
      if (data.size?.toLowerCase().includes("large")) base += 30;
      if (data.quality?.toLowerCase().includes("premium")) base += 50;
      data.price = base;
    }

    // 🔹 DEFAULT NUTRITION IF EMPTY
    data.nutrition = data.nutrition || {};
    data.nutrition.calories = data.nutrition.calories || 100;
    data.nutrition.protein = data.nutrition.protein || 5;
    data.nutrition.fat = data.nutrition.fat || 3;
    data.nutrition.carbs = data.nutrition.carbs || 15;

    const label = await Label.create(data);
    return NextResponse.json({ success: true, label });

  } catch (error) {
    return NextResponse.json({ success: false, msg: error.message }, { status: 500 });
  }
}

/* ================= UPDATE LABEL ================= */
export async function PUT(req) {
  try {
    await connectDB();
    const { _id, ...updates } = await req.json();
    const label = await Label.findByIdAndUpdate(_id, updates, { new: true });
    return NextResponse.json({ success: true, label });
  } catch (error) {
    return NextResponse.json({ success: false, msg: error.message }, { status: 500 });
  }
}

/* ================= DELETE LABEL ================= */
export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    await Label.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, msg: error.message }, { status: 500 });
  }
}
