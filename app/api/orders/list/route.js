import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  await dbConnect();

  const orders = await Order.find().sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,
    orders,
  });
}
