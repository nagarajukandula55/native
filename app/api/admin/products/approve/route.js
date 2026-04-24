import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const { productKey } = await req.json();

    // ✅ VALIDATION
    if (!productKey) {
      return NextResponse.json(
        { success: false, message: "productKey required" },
        { status: 400 }
      );
    }

    const result = await Product.updateMany(
      { productKey },
      {
        status: "approved",
        isActive: true,
        updatedAt: new Date(), // ✅ optional but good
      }
    );

    console.log("Approve Result:", result); // ✅ DEBUG

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });

  } catch (err) {
    console.error("APPROVE ERROR:", err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
