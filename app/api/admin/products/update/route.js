import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const { id, action } = await req.json();

    if (action === "approve") {
      await Product.findByIdAndUpdate(id, {
        status: "approved",
        isActive: true,
      });
    }

    if (action === "reject") {
      await Product.findByIdAndUpdate(id, {
        status: "rejected",
        isActive: false,
      });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
