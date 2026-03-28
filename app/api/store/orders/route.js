import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

/* ================= GET STORE ORDERS ================= */
export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "store") {
      return NextResponse.json(
        { success: false, msg: "Forbidden" },
        { status: 403 }
      );
    }

    /* 🔥 HYBRID FILTER (STORE + FALLBACK WAREHOUSE) */
    const orders = await Order.find({
      $or: [
        { assignedStore: decoded.id }, // ✅ primary
        { "warehouseAssignments.warehouseId": decoded.id }, // fallback
      ],
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (e) {
    console.error("STORE GET ORDERS ERROR:", e);

    return NextResponse.json(
      { success: false, msg: "Server error" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE ORDER ================= */
export async function PUT(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, msg: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "store") {
      return NextResponse.json(
        { success: false, msg: "Forbidden" },
        { status: 403 }
      );
    }

    const {
      id,
      status,
      paymentStatus,
      awbNumber,
      courierName,
      trackingUrl,
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, msg: "Order ID required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, msg: "Order not found" },
        { status: 404 }
      );
    }

    /* 🔥 ACCESS CONTROL (STORE + WAREHOUSE SAFE) */
    const isAllowed =
      (order.assignedStore &&
        order.assignedStore.toString() === decoded.id) ||
      order.warehouseAssignments.some(
        (w) => w.warehouseId.toString() === decoded.id
      );

    if (!isAllowed) {
      return NextResponse.json(
        { success: false, msg: "Not allowed for this order" },
        { status: 403 }
      );
    }

    /* ================= STATUS FLOW CONTROL ================= */

    const validFlow = {
      "Order Placed": "Packed",
      Packed: "Shipped",
      Shipped: "Out For Delivery",
      "Out For Delivery": "Delivered",
    };

    if (status && status !== order.currentStatus) {
      if (validFlow[order.currentStatus] !== status) {
        return NextResponse.json(
          { success: false, msg: "Invalid status transition" },
          { status: 400 }
        );
      }

      // ✅ Flags
      if (status === "Packed") order.isPacked = true;
      if (status === "Shipped") order.isShipped = true;

      // ✅ Update status
      order.status = status;
      order.currentStatus = status;
      order.lastUpdatedAt = new Date();

      // ✅ Timeline
      order.statusHistory.push({
        status,
        time: new Date(),
        updatedBy: decoded.id,
        updatedByModel: "Store",
      });
    }

    /* ================= OTHER UPDATES ================= */

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (awbNumber !== undefined) {
      order.awbNumber = awbNumber;
    }

    if (courierName !== undefined) {
      order.courierName = courierName;
    }

    if (trackingUrl !== undefined) {
      order.trackingUrl = trackingUrl;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (e) {
    console.error("STORE UPDATE ORDER ERROR:", e);

    return NextResponse.json(
      { success: false, msg: "Server error" },
      { status: 500 }
    );
  }
}
