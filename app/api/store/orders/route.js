import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Warehouse from "@/models/Warehouse";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

/* ================= VERIFY STORE ================= */
async function verifyStore(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.role !== "store") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET STORE ORDERS ================= */
export async function GET(req) {
  try {
    await connectDB();
    const user = await verifyStore(req);

    const orders = await Order.find({
      assignedStore: user.id, // ✅ STRICT ONLY STORE ORDERS
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("warehouseAssignments.warehouseId", "name code")
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (e) {
    console.error("STORE GET ORDERS ERROR:", e);

    return NextResponse.json(
      { success: false, message: e.message || "Server error" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE ORDER ================= */
export async function PUT(req) {
  try {
    await connectDB();
    const user = await verifyStore(req);

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
        { success: false, message: "Order ID required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* ✅ STRICT ACCESS CONTROL */
    if (!order.assignedStore || order.assignedStore.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Not allowed for this order" },
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

    if (status && status !== order.status) {
      if (validFlow[order.status] !== status) {
        return NextResponse.json(
          { success: false, message: "Invalid status transition" },
          { status: 400 }
        );
      }

      // ✅ Update status
      order.status = status;

      // ✅ Timeline
      order.statusHistory.push({
        status,
        time: new Date(),
        updatedBy: user.id,
      });
    }

    /* ================= OPTIONAL FIELDS ================= */

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (awbNumber !== undefined) order.awbNumber = awbNumber;
    if (courierName !== undefined) order.courierName = courierName;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order,
    });

  } catch (e) {
    console.error("STORE UPDATE ORDER ERROR:", e);

    return NextResponse.json(
      { success: false, message: e.message || "Server error" },
      { status: 500 }
    );
  }
}
