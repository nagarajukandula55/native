import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";

import Order from "@/models/Order";
import User from "@/models/User";
import Warehouse from "@/models/Warehouse";
import Inventory from "@/models/Inventory";

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
    const decoded = await verifyStore(req);

    // ✅ Get store user (to get warehouseId)
    const storeUser = await User.findById(decoded.id);

    const orders = await Order.find({
      assignedStore: decoded.id, // ✅ ONLY store orders
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("assignedStore", "name email")
      .populate("warehouseAssignments.warehouseId", "name code")
      .lean();

    return NextResponse.json({
      success: true,
      orders,
      storeWarehouse: storeUser?.warehouseId || null,
    });

  } catch (e) {
    console.error("STORE GET ORDERS ERROR:", e);

    const status =
      e.message === "Unauthorized"
        ? 401
        : e.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, msg: e.message || "Server error" },
      { status }
    );
  }
}

/* ================= UPDATE ORDER ================= */
export async function PUT(req) {
  try {
    await connectDB();
    const decoded = await verifyStore(req);

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

    /* ================= ACCESS CONTROL ================= */
    if (!order.assignedStore || order.assignedStore.toString() !== decoded.id) {
      return NextResponse.json(
        { success: false, msg: "Not allowed for this order" },
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
          { success: false, msg: "Invalid status transition" },
          { status: 400 }
        );
      }

      /* ================= INVENTORY DEDUCTION (HOOK READY) ================= */
      if (status === "Packed") {
        const warehouseId = order.warehouseAssignments?.[0]?.warehouseId;

        if (!warehouseId) {
          return NextResponse.json(
            { success: false, msg: "Warehouse not assigned" },
            { status: 400 }
          );
        }

        // 🔥 Loop items → reduce inventory
        for (const item of order.items) {
          const inv = await Inventory.findOne({
            skuId: item.productId, // ⚠️ ensure this matches your SKU
            warehouseId,
          });

          if (!inv || inv.qty < item.quantity) {
            return NextResponse.json(
              { success: false, msg: `Insufficient stock for ${item.name}` },
              { status: 400 }
            );
          }

          inv.qty -= item.quantity;
          await inv.save();
        }
      }

      /* ================= UPDATE STATUS ================= */
      order.status = status;

      order.statusHistory.push({
        status,
        time: new Date(),
        updatedBy: decoded.id,
      });
    }

    /* ================= OTHER UPDATES ================= */
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (awbNumber !== undefined) order.awbNumber = awbNumber;
    if (courierName !== undefined) order.courierName = courierName;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;

    await order.save();

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (e) {
    console.error("STORE UPDATE ORDER ERROR:", e);

    const status =
      e.message === "Unauthorized"
        ? 401
        : e.message === "Forbidden"
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, msg: e.message || "Server error" },
      { status }
    );
  }
}
