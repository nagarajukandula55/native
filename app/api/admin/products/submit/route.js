import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const { productId } = await req.json();

    const product = await Product.findOne({ productKey: productId });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" });
    }

    if (product.status !== "draft") {
      return NextResponse.json({
        success: false,
        message: "Only draft can be submitted",
      });
    }

    product.status = "review";

    product.history.push({
      action: "STATUS_CHANGE",
      before: { status: "draft" },
      after: { status: "review" },
      changedBy: "admin",
    });

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product moved to review",
    });

  } catch (err) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
