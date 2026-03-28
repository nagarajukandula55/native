import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

/* ================= VERIFY STORE ================= */
async function verifyStore(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) return { error: "Unauthorized", status: 401 };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "store") {
      return { error: "Forbidden", status: 403 };
    }

    return { user: decoded };
  } catch (err) {
    return { error: "Invalid token", status: 401 };
  }
}

/* ================= GET STORE ORDERS ================= */
export async function GET(req) {
  try {
    await connectDB();

    const { user, error, status } = await verifyStore(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
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

    const { user, error, status } = await verifyStore(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const body = await req.json();
    console.log("BODY RECEIVED:", body);

    const id = body.id || body.orderId;

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

    /* ================= ACCESS CONTROL ================= */
    if (!order.assignedStore || order.assignedStore.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Not allowed for this order" },
        { status: 403 }
      );
    }

    const {
      status: newStatus,
      paymentStatus,
      awbNumber,
      courierName,
      trackingUrl,
    } = body;

    /* ================= STATUS FLOW ================= */
    const validFlow = {
      "Order Placed": "Packed",
      Packed: "Shipped",
      Shipped: "Out For Delivery",
      "Out For Delivery": "Delivered",
    };

    if (newStatus && newStatus !== order.status) {

      /* 🔒 REQUIRE AWB + COURIER BEFORE SHIPPING */
      if (order.status === "Packed" && newStatus === "Shipped") {
        const finalAWB = awbNumber || order.awbNumber;
        const finalCourier = courierName || order.courierName;

        if (!finalAWB || !finalCourier) {
          return NextResponse.json(
            {
              success: false,
              message: "AWB Number and Courier Name required before shipping",
            },
            { status: 400 }
          );
        }
      }

      /* ❌ INVALID FLOW BLOCK */
      if (validFlow[order.status] !== newStatus) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid transition: ${order.status} → ${newStatus}`,
          },
          { status: 400 }
        );
      }

      /* ✅ UPDATE STATUS */
      order.status = newStatus;

      order.statusHistory.push({
        status: newStatus,
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
