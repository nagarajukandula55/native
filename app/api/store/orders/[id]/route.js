import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "store") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const { status } = await req.json();

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    /* 🔥 ACCESS CONTROL (FIXED) */
    const isAllowed =
      (order.assignedStore &&
        order.assignedStore.toString() === decoded.id) ||
      order.warehouseAssignments?.some(
        (w) => w.warehouseId.toString() === decoded.id
      );

    if (!isAllowed) {
      return NextResponse.json(
        { message: "Not allowed" },
        { status: 403 }
      );
    }

    /* ================= STATUS FLOW ================= */

    const validFlow = {
      "Order Placed": "Packed",
      Packed: "Shipped",
      Shipped: "Out For Delivery",
      "Out For Delivery": "Delivered",
    };

    if (!status || status === order.currentStatus) {
      return NextResponse.json(
        { message: "No status change" },
        { status: 400 }
      );
    }

    if (validFlow[order.currentStatus] !== status) {
      return NextResponse.json(
        { message: "Invalid status transition" },
        { status: 400 }
      );
    }

    /* ================= UPDATE ================= */

    // Flags
    if (status === "Packed") order.isPacked = true;
    if (status === "Shipped") order.isShipped = true;

    // Status sync
    order.status = status;
    order.currentStatus = status;
    order.lastUpdatedAt = new Date();

    // Timeline (correct schema)
    order.statusHistory.push({
      status,
      time: new Date(),
      updatedBy: decoded.id,
      updatedByModel: "Store",
    });

    await order.save();

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
