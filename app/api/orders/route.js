import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

/* ================= SAFE ORDER ID ================= */
function generateOrderId() {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `NAT-${yy}${mm}${dd}-${rand}`;
}

/* ================= CREATE ORDER ================= */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("ORDER BODY:", body);

    const {
      customerName,
      phone,
      email,
      address,
      pincode,
      items,
      paymentMethod,
    } = body;

    /* ================= VALIDATION ================= */
    if (
      !customerName ||
      !phone ||
      !address ||
      !pincode ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json({
        success: false,
        msg: "Missing required fields",
      });
    }

    /* ================= VALIDATE ITEMS ================= */
    for (const item of items) {
      if (!item.productId) {
        return NextResponse.json({
          success: false,
          msg: "Invalid product data (productId missing)",
        });
      }
    }

    /* ================= TOTAL ================= */
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    /* ================= WAREHOUSE ================= */
    const warehouse = await Warehouse.findOne();

    if (!warehouse) {
      return NextResponse.json({
        success: false,
        msg: "No warehouse configured",
      });
    }

    /* ================= ORDER ID ================= */
    let orderId = generateOrderId();

    // 🔥 ensure unique
    const exists = await Order.findOne({ orderId });
    if (exists) {
      orderId = generateOrderId();
    }

    if (!orderId) {
      return NextResponse.json({
        success: false,
        msg: "Order ID generation failed",
      });
    }

    /* ================= RESERVE STOCK ================= */
    await reserveStock(items, warehouse._id);

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      orderId: orderId, // 🔥 IMPORTANT FIX
      customerName,
      phone,
      email: email || "",
      address,
      pincode,
      items,
      totalAmount,
      status: "Order Placed",
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "Pending",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [
        { status: "Order Placed", time: new Date() },
      ],
    });

    console.log("ORDER CREATED:", order.orderId);

    return NextResponse.json({
      success: true,
      order: order,
    });

  } catch (e) {
    console.error("CREATE ORDER ERROR:", e);

    return NextResponse.json({
      success: false,
      msg: e.message || "Server error",
    });
  }
}

/* ================= GET ================= */
export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (e) {
    console.error("FETCH ERROR:", e);

    return NextResponse.json({
      success: false,
    });
  }
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  try {
    await connectDB();

    const {
      id,
      status,
      paymentStatus,
      awbNumber,
      courierName,
      trackingUrl,
    } = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        msg: "Order ID required",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({
        success: false,
        msg: "Order not found",
      });
    }

    if (status) {
      order.status = status;
      order.statusHistory.push({
        status,
        time: new Date(),
      });
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (awbNumber) order.awbNumber = awbNumber;
    if (courierName) order.courierName = courierName;
    if (trackingUrl) order.trackingUrl = trackingUrl;

    await order.save();

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (e) {
    console.error("UPDATE ERROR:", e);

    return NextResponse.json({
      success: false,
    });
  }
}
