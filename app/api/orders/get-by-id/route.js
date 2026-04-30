import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    console.log("➡️ API HIT: get-by-id");

    await dbConnect();
    console.log("✔ DB Connected");

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    console.log("🔍 OrderId:", orderId);

    if (!orderId) {
      return Response.json({
        success: false,
        message: "Order ID missing",
      });
    }

    const order = await Order.findOne({
      orderId: orderId.trim(),
    });

    console.log("📦 Order Found:", order);

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
    console.error("🔥 SERVER ERROR:", err);

    return Response.json({
      success: false,
      message: "Server error",
      error: err.message,   // 👈 IMPORTANT DEBUG INFO
    });
  }
}
