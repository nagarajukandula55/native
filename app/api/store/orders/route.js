export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { shipStock, deliverStock } from "@/lib/inventory";

/* ================= VERIFY ================= */
function verify(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/* ================= STATUS FLOW ================= */
const validFlow = {
  "Order Placed": "Packed",
  Packed: "Shipped",
  Shipped: "Out For Delivery",
  "Out For Delivery": "Delivered",
};

/* ================= GET ================= */
export async function GET(req) {
  try {
    await connectDB();

    const user = verify(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await Order.find({
      assignedStore: user.id,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("warehouseAssignments.warehouseId", "name code");

    return NextResponse.json({ success: true, orders });

  } catch (e) {
    console.error("GET STORE ORDERS ERROR:", e);
    return NextResponse.json({ success: false, message: e.message });
  }
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  try {
    await connectDB();

    const user = verify(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, status, awbNumber, courierName, trackingUrl } =
      await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Order ID required",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({
        success: false,
        message: "Order not found",
      });
    }

    /* 🔒 ACCESS CONTROL */
    if (
      !order.assignedStore ||
      order.assignedStore.toString() !== user.id
    ) {
      return NextResponse.json({
        success: false,
        message: "Not allowed",
      });
    }

    /* 🔥 GET WAREHOUSE ID SAFE */
    let warehouseId =
      order.warehouseAssignments?.[0]?.warehouseId;

    if (!warehouseId) {
      return NextResponse.json({
        success: false,
        message: "Warehouse not assigned",
      });
    }

    // normalize ObjectId
    if (typeof warehouseId === "object" && warehouseId._id) {
      warehouseId = warehouseId._id;
    }

    const wid = new mongoose.Types.ObjectId(warehouseId);

    /* ================= STATUS CHANGE ================= */
    if (status && status !== order.status) {

      /* ❌ INVALID FLOW BLOCK */
      if (validFlow[order.status] !== status) {
        return NextResponse.json({
          success: false,
          message: `Invalid status flow: ${order.status} → ${status}`,
        });
      }

      /* ================= SHIPPED ================= */
      if (order.status === "Packed" && status === "Shipped") {

        if (!awbNumber || !courierName) {
          return NextResponse.json({
            success: false,
            message: "AWB & Courier required",
          });
        }

        // ✅ MOVE STOCK
        await shipStock(order.items, wid);
      }

      /* ================= DELIVERED ================= */
      if (
        order.status === "Out For Delivery" &&
        status === "Delivered"
      ) {
        await deliverStock(order.items, wid);
      }

      /* ✅ UPDATE STATUS */
      order.status = status;

      order.statusHistory.push({
        status,
        time: new Date(),
        updatedBy: user.id,
      });
    }

    /* ================= OPTIONAL FIELDS ================= */
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
    console.error("STORE UPDATE ERROR:", e);

    return NextResponse.json({
      success: false,
      message: e.message,
    });
  }
}
