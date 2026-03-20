export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import db from "@/lib/db";
import Order from "@/models/Order";

/* ================= SAFE AWB GENERATOR ================= */
function generateAWB() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AWB${timestamp}${random}`;
}

export async function POST(req) {
  try {
    await db();

    /* ✅ SAFE BODY PARSE */
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({
        success: false,
        message: "Invalid JSON body"
      }, { status: 400 });
    }

    const { orderId } = body;

    /* ✅ VALIDATION */
    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "orderId is required"
      }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({
        success: false,
        message: "Invalid orderId"
      }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({
        success: false,
        message: "Order not found"
      }, { status: 404 });
    }

    /* ✅ REUSE EXISTING AWB */
    if (order.awbNumber) {
      return NextResponse.json({
        success: true,
        awb: order.awbNumber,
        courier: order.courierName,
      });
    }

    /* ✅ GENERATE NEW AWB */
    const awb = generateAWB();

    order.awbNumber = awb;
    order.courierName = "Delhivery";
    order.trackingUrl = `https://track.delhivery.com/${awb}`;

    await order.save();

    return NextResponse.json({
      success: true,
      awb,
      courier: order.courierName,
    });

  } catch (err) {
    console.error("AWB ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "Server error"
    }, { status: 500 });
  }
}
