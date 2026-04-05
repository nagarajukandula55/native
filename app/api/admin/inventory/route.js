export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import jwt from "jsonwebtoken";

/* ================= VERIFY ADMIN ================= */
function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.role !== "admin") {
    throw new Error("Forbidden");
  }

  return decoded;
}

/* ================= GET INVENTORY ================= */
export async function GET(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId");

    let filter = {};

    if (warehouseId) {
      filter.warehouseId = warehouseId;
    }

    const inventory = await Inventory.find(filter)
      .populate("productId", "name sku price")
      .populate("warehouseId", "name code")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: inventory.length,
      data: inventory,
    });

  } catch (e) {
    console.error("INVENTORY ERROR:", e);

    return NextResponse.json(
      {
        success: false,
        message: e.message || "Server error",
      },
      {
        status:
          e.message === "Unauthorized"
            ? 401
            : e.message === "Forbidden"
            ? 403
            : 500,
      }
    );
  }
}
