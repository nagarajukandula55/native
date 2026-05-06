import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const order = await Order.findById(params.id).lean();

    if (!order) {
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (err) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
