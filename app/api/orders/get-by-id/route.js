import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    console.log("📡 TRACK API CALLED");

    // 1. DB CONNECT
    await dbConnect();
    console.log("✅ DB CONNECTED");

    // 2. GET ORDER ID
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    console.log("🔎 orderId:", orderId);

    if (!orderId) {
      return Response.json({
        success: false,
        message: "Order ID missing",
      });
    }

    // 3. FIND ORDER (SAFE QUERY)
    const order = await Order.findOne({
      orderId: String(orderId).trim(),
    });

    console.log("📦 order found:", !!order);

    if (!order) {
      return Response.json({
        success: false,
        message: "Order not found",
      });
    }

    return Response.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error("🔥 TRACK API ERROR:", err);

    return Response.json({
      success: false,
      message: "Server error",
      error: err?.message || "unknown",
    });
  }
}
