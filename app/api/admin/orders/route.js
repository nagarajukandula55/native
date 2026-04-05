export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";

import Order from "@/models/Order";
import User from "@/models/User";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

/* ================= VERIFY ADMIN ================= */
function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET ALL ORDERS ================= */
export async function GET(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    const orders = await Order.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("assignedStore", "name email")
      .populate("warehouseAssignments.warehouseId", "name code")
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (err) {
    console.error("ADMIN GET ORDERS ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

/* ================= ASSIGN ORDER ================= */
export async function PUT(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    const { id, storeId, warehouseId } = await req.json();

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

    /* ================= ASSIGN STORE ================= */
    if (storeId) {
      const store = await User.findById(storeId);

      if (!store || store.role !== "store") {
        return NextResponse.json({
          success: false,
          message: "Invalid store",
        });
      }

      order.assignedStore = storeId;
    }

    /* ================= ASSIGN WAREHOUSE ================= */
    if (warehouseId) {
      const warehouse = await Warehouse.findById(warehouseId);

      if (!warehouse) {
        return NextResponse.json({
          success: false,
          message: "Invalid warehouse",
        });
      }

      /* 🔥 SAFE STOCK RESERVATION */
      await reserveStock(order.items, warehouseId);

      order.warehouseAssignments = [
        {
          warehouseId,
        },
      ];
    }

    /* ================= SAVE ================= */
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order assigned successfully",
      order,
    });

  } catch (err) {
    console.error("ADMIN ASSIGN ERROR:", err);

    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}
