import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

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
  } catch (e) {
    console.error("GET STORE ORDERS ERROR:", e);

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

    const {
      id,
      status,
      awbNumber,
      courierName,
      trackingUrl,
    } = body;

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
    if (order.assignedStore?.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Not allowed" },
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
      const allowedNext = validFlow[order.status];

      if (allowedNext !== status) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status flow: ${order.status} → ${status}`,
          },
          { status: 400 }
        );
      }

      /* ================= SHIPPING VALIDATION ================= */
      if (order.status === "Packed" && status === "Shipped") {
        const finalAWB = awbNumber || order.awbNumber;
        const finalCourier = courierName || order.courierName;

        if (!finalAWB || !finalCourier) {
          return NextResponse.json(
            {
              success: false,
              message: "AWB Number and Courier Name required",
            },
            { status: 400 }
          );
        }
      }

      /* ================= UPDATE STATUS ================= */
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
      message: "Order updated",
      order,
    });

  } catch (e) {
    console.error("UPDATE STORE ORDER ERROR:", e);

    return NextResponse.json(
      { success: false, message: e.message || "Server error" },
      { status: 500 }
    );
  }
}
