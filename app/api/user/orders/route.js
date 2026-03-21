import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await connectDB();

  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const orders = await Order.find({ email: decoded.email }).sort({ createdAt: -1 });

  return Response.json({ success: true, orders });
}
