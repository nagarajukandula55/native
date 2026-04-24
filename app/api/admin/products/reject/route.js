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
        $set: {
          status: "rejected",
          isActive: false,
          updatedAt: new Date(), // ✅ good practice
        },
      }
    );

    console.log("Reject Result:", result); // ✅ DEBUG

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });

  } catch (err) {
    console.error("REJECT ERROR:", err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
