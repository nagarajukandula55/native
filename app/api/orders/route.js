import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

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
        { success: false, msg: "Missing required fields" },
        { status: 400 }
      );
    }

    const warehouse = await Warehouse.findOne();

    if (!warehouse) {
      return NextResponse.json(
        { success: false, msg: "No warehouse configured" },
        { status: 400 }
      );
    }

    /* ✅ RESERVE STOCK */
    await reserveStock(body.items, warehouse._id);

    /* ✅ CREATE ORDER */
    const order = await Order.create({
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      pincode: body.pincode,
      items: body.items,
      totalAmount: body.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      ),
      status: "Order Placed",
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "Pending",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    return NextResponse.json({ success: true, order });

  } catch (e) {
    console.error("ORDER ERROR:", e);
    return NextResponse.json(
      { success: false, msg: e.message },
      { status: 400 }
    );
  }
}

/* ================= FETCH ORDERS ================= */
export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });

  } catch (e) {
    return NextResponse.json({ success: false });
  }
}
