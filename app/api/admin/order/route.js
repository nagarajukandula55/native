// app/api/admin/order/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";

import Order from "@/models/Order";
import Inventory from "@/models/Inventory";
import User from "@/models/User";
import Warehouse from "@/models/Warehouse";

/* ================= AUTH ================= */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.role || decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET ORDERS (GROUPED) ================= */
export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const orders = await Order.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("assignedStore", "name email")
      .populate("warehouseAssignments.warehouseId", "name code")
      .lean();

    // 🔥 Grouping for tabs UI
    const grouped = {
      pending: [],
      assigned: [],
      packed: [],
      shipped: [],
      delivered: [],
    };

    orders.forEach((order) => {
      if (!order.assignedStore) {
        grouped.pending.push(order);
      } else if (order.status === "Order Placed") {
        grouped.assigned.push(order);
      } else if (order.status === "Packed") {
        grouped.packed.push(order);
      } else if (order.status === "Shipped") {
        grouped.shipped.push(order);
      } else if (order.status === "Delivered") {
        grouped.delivered.push(order);
      } else {
        grouped.assigned.push(order); // fallback
      }
    });

    return NextResponse.json({ success: true, grouped });
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);

    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status }
    );
  }
}

/* ================= ASSIGN ORDER ================= */
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { orderId, storeId, warehouseId } = await req.json();

    if (!orderId)
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );

    const order = await Order.findById(orderId);
    if (!order)
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );

    /* ===== STORE ASSIGNMENT ===== */
    if (storeId) {
      const store = await User.findById(storeId);
      if (!store || store.role !== "store") {
        return NextResponse.json(
          { success: false, message: "Invalid store" },
          { status: 400 }
        );
      }

      order.assignedStore = storeId;
    }

    /* ===== WAREHOUSE ASSIGNMENT ===== */
    if (warehouseId) {
      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        return NextResponse.json(
          { success: false, message: "Invalid warehouse" },
          { status: 400 }
        );
      }

      order.warehouseAssignments = [
        {
          warehouseId,
          assignedAt: new Date(),
        },
      ];
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order assigned successfully",
      order,
    });
  } catch (err) {
    console.error("ASSIGN ORDER ERROR:", err);

    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status }
    );
  }
}

/* ================= FETCH INVENTORY ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { warehouseId } = await req.json();

    if (!warehouseId)
      return NextResponse.json(
        { success: false, message: "Warehouse ID required" },
        { status: 400 }
      );

    const inventory = await Inventory.find({ warehouseId })
      .populate("skuId", "name code")
      .lean();

    return NextResponse.json({
      success: true,
      inventory,
    });
  } catch (err) {
    console.error("FETCH INVENTORY ERROR:", err);

    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status }
    );
  }
}
