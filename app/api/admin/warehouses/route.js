import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Warehouse from "@/models/Warehouse";
import jwt from "jsonwebtoken";

async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);
    const warehouses = await Warehouse.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, warehouses });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500 });
  }
}
