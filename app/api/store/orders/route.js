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

    // 🔥 PRIMARY: Assigned store orders
    let query = {
      assignedStore: decoded.id,
      isDeleted: false,
    };

    // 🔁 OPTIONAL: also support warehouse mapping (future)
    if (decoded.warehouseId) {
      query = {
        $or: [
          { assignedStore: decoded.id },
          { "warehouseAssignments.warehouseId": decoded.warehouseId },
        ],
        isDeleted: false,
      };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });

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

    /* ===== ACCESS CONTROL ===== */
    const isAssignedStore =
      order.assignedStore?.toString() === decoded.id;

    const isWarehouseAssigned =
      decoded.warehouseId &&
      order.warehouseAssignments.some(
        (w) => w.warehouseId.toString() === decoded.warehouseId
      );

    if (!isAssignedStore && !isWarehouseAssigned) {
      return NextResponse.json(
        { success: false, msg: "Not allowed for this order" },
        { status: 403 }
      );
    }

    /* ===== UPDATE FIELDS ===== */

    if (status) {
      order.status = status;

      order.statusHistory.push({
        status,
        time: new Date(),
        updatedBy: decoded.id, // 🔥 track who updated
      });
    }

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
