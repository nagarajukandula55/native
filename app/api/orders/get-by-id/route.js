import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    // 🔴 VALIDATION
    if (!orderId || !orderId.trim()) {
      return Response.json({
        success: false,
        message: "Order ID missing",
      });
    }

    const cleanOrderId = orderId.trim();

    // 🔍 FIND ORDER (SAFE MATCH)
    const order = await Order.findOne({
      orderId: cleanOrderId,
    }).lean(); // faster + safer response

    if (!order) {
      return Response.json({
        success: false,
        message: "Order not found",
      });
    }

    // 🧠 ENSURE SAFE RESPONSE STRUCTURE
    return Response.json({
      success: true,
      order: {
        ...order,

        // fallback safety for tracking UI
        status: order.status || "PENDING_PAYMENT",

        // ensure timeline always exists
        timeline: order.timeline || [
          {
            status: order.status || "PENDING_PAYMENT",
            time: order.createdAt || new Date(),
          },
        ],
      },
    });
  } catch (err) {
    console.error("GET_ORDER_ERROR:", err);

    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}
