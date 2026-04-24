import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const { productKey } = await req.json();

    await Product.updateMany(
      { productKey },
      {
        $set: {
          status: "rejected",
          isActive: false,
        },
      }
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
