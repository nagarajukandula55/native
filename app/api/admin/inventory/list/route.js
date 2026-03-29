import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import Product from "@/models/Product";
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

    const inventory = await Inventory.find({})
      .populate("productId", "name sku")
      .populate("warehouseId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, inventory });
  } catch (err) {
    console.error("GET INVENTORY LIST ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
