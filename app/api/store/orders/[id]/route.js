import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "store") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Ensure store owns this order
    if (order.assignedTo.toString() !== decoded.id) {
      return NextResponse.json({ message: "Not allowed" }, { status: 403 });
    }

    order.status = status;

    order.timeline.push({
      status,
      time: new Date(),
    });

    await order.save();

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
