import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const { id, action } = await req.json();

    // ✅ VALIDATION
    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "id and action required" },
        { status: 400 }
      );
    }

    let updateData = {};

    if (action === "approve") {
      updateData = {
        status: "approved",
        isActive: true,
        updatedAt: new Date(),
      };
    }

    if (action === "reject") {
      updateData = {
        status: "rejected",
        isActive: false,
        updatedAt: new Date(),
      };
    }

    if (!updateData.status) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    // ✅ UPDATE
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    // ✅ CHECK IF FOUND
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    console.log("UPDATE SUCCESS:", updatedProduct._id, action);

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });

  } catch (err) {
    console.error("UPDATE ERROR:", err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
