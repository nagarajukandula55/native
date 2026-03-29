import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= RESERVE ================= */
export async function reserveStock(items, warehouseId) {
  for (const item of items) {
    const inventory = await Inventory.findOne({
      productId: item.productId,
      warehouseId,
    });

    if (!inventory || inventory.availableQty < item.quantity) {
      throw new Error("Out of stock");
    }

    await Inventory.updateOne(
      { _id: inventory._id },
      {
        $inc: {
          availableQty: -item.quantity,
          reservedQty: item.quantity,
        },
      }
    );
  }
}

/* ================= SHIP ================= */
export async function shipStock(items, warehouseId) {
  for (const item of items) {
    await Inventory.updateOne(
      { productId: item.productId, warehouseId },
      {
        $inc: {
          reservedQty: -item.quantity,
          shippedQty: item.quantity,
        },
      }
    );
  }
}

/* ================= DELIVER ================= */
export async function deliverStock(items, warehouseId) {
  for (const item of items) {
    await Inventory.updateOne(
      { productId: item.productId, warehouseId },
      {
        $inc: {
          shippedQty: -item.quantity,
        },
      }
    );
  }
}
