import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

/* ================= CREATE ORDER ================= */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    if (
      !body.customerName ||
      !body.phone ||
      !body.address ||
      !body.pincode ||
      !body.items ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ================= FIND WAREHOUSE ================= */
    const warehouse = await Warehouse.findOne();

    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "No warehouse configured" },
        { status: 500 }
      );
    }

    /* ================= RESERVE STOCK ================= */
    try {
      await reserveStock(body.items, warehouse._id);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 400 }
      );
    }

    /* ================= TOTAL ================= */
    const totalAmount = body.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const orderId = `NAT-${Date.now()}`;

    /* ================= CREATE ================= */
    const order = await Order.create({
      orderId,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      pincode: body.pincode,
      items: body.items,
      totalAmount,
      status: "Order Placed",
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "Pending",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
    });

  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}

/* ================= FETCH ================= */
export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
