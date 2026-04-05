import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import mongoose from "mongoose";

export async function PUT(req) {
  try {
    await connectDB();

    const { productId, warehouseId, quantity, type } =
      await req.json();

    const pid = new mongoose.Types.ObjectId(productId);
    const wid = new mongoose.Types.ObjectId(warehouseId);

    let inventory = await Inventory.findOne({
      productId: pid,
      warehouseId: wid,
    });

    if (!inventory) {
      inventory = await Inventory.create({
        productId: pid,
        warehouseId: wid,
        availableQty: 0,
      });
    }

    if (type === "ADD") {
      inventory.availableQty += quantity;
    }

    if (type === "REMOVE") {
      if (inventory.availableQty < quantity) {
        return NextResponse.json({
          success: false,
          message: "Not enough stock",
        });
      }
      inventory.availableQty -= quantity;
    }

    await inventory.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}
