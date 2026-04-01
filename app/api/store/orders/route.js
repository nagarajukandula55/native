import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { shipStock, deliverStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

/* ================= VERIFY STORE ================= */
function verifyStore(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "store") return null;
    return decoded;
  } catch {
    return null;
  }
}

/* ================= GET STORE ORDERS ================= */
export async function GET(req) {
  try {
    await connectDB();

    const user = verifyStore(req);

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
      .populate("warehouseAssignments.warehouseId", "name code")
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("STORE GET ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE ORDER ================= */
export async function PUT(req) {
  try {
    await connectDB();

    const user = verifyStore(req);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, status, awbNumber, courierName, trackingUrl } = body;

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

    /* ================= SECURITY ================= */
    if (!order.assignedStore || order.assignedStore.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Not allowed" },
        { status: 403 }
      );
    }

    const validFlow = {
      "Order Placed": "Packed",
      Packed: "Shipped",
      Shipped: "Out For Delivery",
      "Out For Delivery": "Delivered",
    };

    const warehouseId = order.warehouseAssignments?.[0]?.warehouseId;

    if (!warehouseId) {
      return NextResponse.json(
        { success: false, message: "Warehouse missing" },
        { status: 400 }
      );
    }

    /* ================= STATUS UPDATE ================= */
    if (status && status !== order.status) {
      /* ❌ INVALID FLOW */
      if (validFlow[order.status] !== status) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid transition ${order.status} → ${status}`,
          },
          { status: 400 }
        );
      }

      /* ================= SHIPPED ================= */
      if (order.status === "Packed" && status === "Shipped") {
        const finalAWB = awbNumber || order.awbNumber;
        const finalCourier = courierName || order.courierName;

        if (!finalAWB || !finalCourier) {
          return NextResponse.json(
            {
              success: false,
              message: "AWB & Courier required before shipping",
            },
            { status: 400 }
          );
        }

        // ✅ MOVE INVENTORY
        await shipStock(order.items, warehouseId);
      }

      /* ================= DELIVERED ================= */
      if (order.status === "Out For Delivery" && status === "Delivered") {
        await deliverStock(order.items, warehouseId);
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

  } catch (err) {
    console.error("STORE UPDATE ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
