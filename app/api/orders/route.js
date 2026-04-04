export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { allocateAndReserveStock } from "@/lib/inventory";

/* ================= ORDER ID ================= */
function generateOrderId() {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `NAT-${yy}${mm}${dd}-${rand}`;
}

/* ================= CREATE ORDER ================= */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    if (
      !body.customerName ||
      !body.phone ||
      !body.address ||
      !body.items?.length
    ) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    /* ================= ALLOCATE STOCK ================= */
    const allocations = await allocateAndReserveStock(body.items);

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      orderId: generateOrderId(),

      customerName: body.customerName,
      phone: body.phone,
      email: body.email || "",

      address: body.address,
      pincode: body.pincode,

      items: body.items,
      allocations,

      totalAmount: body.items.reduce(
        (sum, i) => sum + Number(i.price) * Number(i.quantity),
        0
      ),

      status: "Order Placed",

      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "Pending",

      statusHistory: [
        {
          status: "Order Placed",
          time: new Date(),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (e) {
    console.error("ORDER ERROR:", e);

    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
