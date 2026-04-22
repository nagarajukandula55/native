import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();

    const { id, status } = await req.json();

    await Order.findByIdAndUpdate(id, { status });

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
