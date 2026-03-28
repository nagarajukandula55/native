import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import jwt from "jsonwebtoken";

/* ================= VERIFY ADMIN ================= */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= ADD / UPDATE INVENTORY ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { skuId, warehouseId, qty } = await req.json();

    if (!skuId || !warehouseId || qty == null) {
      return NextResponse.json(
        { success: false, message: "skuId, warehouseId, qty required" },
        { status: 400 }
      );
    }

    let inventory = await Inventory.findOne({ skuId, warehouseId });

    if (inventory) {
      inventory.qty += Number(qty);
      await inventory.save();
    } else {
      inventory = await Inventory.create({
        skuId,
        warehouseId,
        qty: Number(qty),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Inventory updated",
      inventory,
    });

  } catch (err) {
    console.error("ADD INVENTORY ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
