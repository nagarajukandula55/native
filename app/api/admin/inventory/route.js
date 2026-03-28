import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
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

/* ================= ADD INVENTORY ================= */
export async function POST(req) {
  try {
    await connectDB();

    const { error, status } = await verifyAdmin(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const { productId, warehouseId, qty } = await req.json();

    /* 🔥 VALIDATION FIX */
    if (!productId || !warehouseId || qty === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "productId, warehouseId, qty required",
        },
        { status: 400 }
      );
    }

    /* 🔥 FIND EXISTING INVENTORY */
    let inventory = await Inventory.findOne({
      productId,
      warehouseId,
    });

    if (inventory) {
      // ✅ UPDATE EXISTING
      inventory.availableQty += qty;
    } else {
      // ✅ CREATE NEW
      inventory = await Inventory.create({
        productId,
        warehouseId,
        availableQty: qty,
      });
    }

    await inventory.save();

    return NextResponse.json({
      success: true,
      message: "Inventory updated",
      inventory,
    });

  } catch (err) {
    console.error("INVENTORY ADD ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
