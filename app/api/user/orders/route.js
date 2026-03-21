import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return Response.json({ success: false, msg: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const orders = await Order.find({
      email: decoded.email,
    }).sort({ createdAt: -1 });

    return Response.json({ success: true, orders });

  } catch (err) {
    console.error(err);
    return Response.json({ success: false, msg: "Server error" });
  }
}
