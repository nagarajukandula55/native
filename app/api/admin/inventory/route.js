import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import Product from "@/models/Product";
import Warehouse from "@/models/Warehouse";
import jwt from "jsonwebtoken";

/* ================= ADMIN AUTH ================= */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= GET INVENTORY ================= */
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
    console.error("GET INVENTORY ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

/* ================= ADD / UPDATE INVENTORY ================= */
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

    // Check if product & warehouse exist
    const product = await Product.findById(productId);
    const warehouse = await Warehouse.findById(warehouseId);

    if (!product || !warehouse) {
      return NextResponse.json(
        { success: false, message: "Invalid product or warehouse" },
        { status: 400 }
      );
    }

    // Find existing inventory for product + warehouse
    let inventory = await Inventory.findOne({ productId, warehouseId });

    if (inventory) {
      // ✅ Update existing stock
      inventory.availableQty += Number(qty);
    } else {
      // ✅ Create new inventory record
      inventory = new Inventory({
        productId,
        warehouseId,
        availableQty: Number(qty),
      });
    }

    await inventory.save();

    return NextResponse.json({ success: true, inventory });
  } catch (err) {
    console.error("POST INVENTORY ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to add inventory" },
      { status: 500 }
    );
  }
}
