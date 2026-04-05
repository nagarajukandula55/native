export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import mongoose from "mongoose";
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

/* ================= UPDATE INVENTORY ================= */
export async function POST(req) {
  const session = await mongoose.startSession();

  try {
    await connectDB();
    verifyAdmin(req);

    const { productId, warehouseId, quantity, type } =
      await req.json();

    /*
      type:
      ADD      → increase stock
      REMOVE   → decrease stock
      SET      → overwrite stock
    */

    if (!productId || !warehouseId || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "productId, warehouseId, quantity required",
        },
        { status: 400 }
      );
    }

    if (!["ADD", "REMOVE", "SET"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid type (ADD / REMOVE / SET)",
        },
        { status: 400 }
      );
    }

    await session.startTransaction();

    const productObjectId = new mongoose.Types.ObjectId(productId);
    const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

    let inventory = await Inventory.findOne({
      productId: productObjectId,
      warehouseId: warehouseObjectId,
    }).session(session);

    /* ================= CREATE IF NOT EXISTS ================= */
    if (!inventory) {
      if (type === "REMOVE") {
        throw new Error("Cannot remove from non-existing stock");
      }

      inventory = new Inventory({
        productId: productObjectId,
        warehouseId: warehouseObjectId,
        availableQty: 0,
        reservedQty: 0,
        shippedQty: 0,
      });
    }

    /* ================= APPLY LOGIC ================= */

    if (type === "ADD") {
      inventory.availableQty += Number(quantity);
    }

    if (type === "REMOVE") {
      if (inventory.availableQty < quantity) {
        throw new Error("Insufficient stock");
      }

      inventory.availableQty -= Number(quantity);
    }

    if (type === "SET") {
      if (quantity < 0) {
        throw new Error("Stock cannot be negative");
      }

      inventory.availableQty = Number(quantity);
    }

    await inventory.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      message: "Inventory updated successfully",
      inventory,
    });

  } catch (e) {
    await session.abortTransaction();
    session.endSession();

    console.error("INVENTORY UPDATE ERROR:", e);

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
