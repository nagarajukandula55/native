import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    console.log("📡 TRACK API HIT");

    await dbConnect();
    console.log("✅ DB CONNECTED");

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    console.log("🔎 ORDER ID:", orderId);

    if (!orderId) {
      return Response.json({
        success: false,
        message: "Order ID missing",
      });
    }

    const order = await Order.findOne({
      orderId: orderId.trim(),
    }).lean();

    console.log("📦 ORDER RESULT:", order);

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
    console.error("🔥 FULL SERVER ERROR:", err);

    return Response.json({
      success: false,
      message: "Server error",
      error: err.message,
      stack: err.stack,
    });
  }
}
