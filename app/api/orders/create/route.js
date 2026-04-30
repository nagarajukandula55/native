import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log("📦 ORDER REQUEST:", body);

    const { cart, amount, address } = body;

    /* ================= VALIDATION ================= */
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    /* ================= CREATE ORDER ================= */
    const orderDoc = await Order.create({
      orderId: "ORD_" + Date.now(),
      items: cart,
      amount,
      address: address || null,

      status: "CREATED",

      payment: {
        method: "COD_OR_PENDING",
        status: "PENDING",
      },
    });

    console.log("🟢 ORDER CREATED:", orderDoc._id);

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: orderDoc._id,
      order: orderDoc,
    });

  } catch (err) {
    console.error("🔥 ORDER CREATE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Order creation failed",
      },
      { status: 500 }
    );
  }
}
