import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return Response.json({
        success: false,
        message: "Order ID missing",
      });
    }

    const order = await Order.findOne({
      orderId: orderId,
    });

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
    console.error(err);

    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}
