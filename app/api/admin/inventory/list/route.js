import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
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

    const inventory = await Inventory.find({})
      .populate("productId", "name")
      .populate("warehouseId", "name code")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      inventory,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
