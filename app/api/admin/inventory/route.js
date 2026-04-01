export const dynamic = "force-dynamic"; // ✅ VERY IMPORTANT

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import jwt from "jsonwebtoken";

/* ===================== ADMIN AUTH ===================== */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ===================== GET INVENTORY ===================== */
export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const inventory = await Inventory.find({})
      .populate("productId", "name sku")
      .populate("warehouseId", "name code")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, inventory });

  } catch (err) {
    console.error("GET INVENTORY ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.message.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

/* ===================== ADD STOCK ===================== */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { productId, warehouseId, qty } = await req.json();

    if (!productId || !warehouseId || qty === undefined) {
      return NextResponse.json(
        { success: false, message: "productId, warehouseId, qty required" },
        { status: 400 }
      );
    }

    let inventory = await Inventory.findOne({ productId, warehouseId });

    if (!inventory) {
      inventory = await Inventory.create({
        productId,
        warehouseId,
        availableQty: Number(qty),
        reservedQty: 0,
        shippedQty: 0,
      });
    } else {
      inventory.availableQty += Number(qty);
      await inventory.save();
    }

    return NextResponse.json({ success: true, inventory });

  } catch (err) {
    console.error("POST INVENTORY ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
