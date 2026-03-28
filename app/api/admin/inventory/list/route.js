import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import Product from "@/models/Product";     // ✅ REQUIRED
import Warehouse from "@/models/Warehouse"; // ✅ REQUIRED
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

/* ================= VERIFY ADMIN ================= */
async function verifyAdmin(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) return { error: "Unauthorized", status: 401 };

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return { error: "Forbidden", status: 403 };
    }

    return { user: decoded };
  } catch (err) {
    return { error: "Invalid token", status: 401 };
  }
}

/* ================= GET INVENTORY ================= */
export async function GET(req) {
  try {
    await connectDB();

    const { error, status } = await verifyAdmin(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const inventory = await Inventory.find({})
      .populate({
        path: "productId",
        model: "Product",
        select: "name sku",
      })
      .populate({
        path: "warehouseId",
        model: "Warehouse",
        select: "name code",
      })
      .sort({ createdAt: -1 })
      .lean();

    console.log("INVENTORY DATA:", inventory); // 🔥 DEBUG

    return NextResponse.json({
      success: true,
      count: inventory.length,
      inventory,
    });

  } catch (err) {
    console.error("INVENTORY LIST ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
