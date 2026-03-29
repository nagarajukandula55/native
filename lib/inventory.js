import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= HELPER ================= */
function toObjectId(id) {
  if (!id) throw new Error("Invalid ID");
  return typeof id === "string"
    ? new mongoose.Types.ObjectId(id)
    : id;
}

/* ================= RESERVE ================= */
export async function reserveStock(items, warehouseId) {
  const warehouseObjectId = toObjectId(warehouseId);

  for (const item of items) {
    const productId = toObjectId(item.productId || item.product);
    const qty = Number(item.quantity);

    let inventory = await Inventory.findOne({
      productId,
      warehouseId: warehouseObjectId,
    });

    // 🔥 AUTO CREATE
    if (!inventory) {
      inventory = await Inventory.create({
        productId,
        warehouseId: warehouseObjectId,
        availableQty: 0,
        reservedQty: 0,
        shippedQty: 0,
      });
    }

    if (inventory.availableQty < qty) {
      throw new Error(`Out of stock. Available: ${inventory.availableQty}`);
    }

    const result = await Inventory.updateOne(
      {
        productId,
        warehouseId: warehouseObjectId,
        availableQty: { $gte: qty },
      },
      {
        $inc: {
          availableQty: -qty,
          reservedQty: qty,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Stock conflict");
    }
  }
}

/* ================= SHIP ================= */
export async function shipStock(items, warehouseId) {
  const warehouseObjectId = toObjectId(warehouseId);

  for (const item of items) {
    const productId = toObjectId(item.productId || item.product);
    const qty = Number(item.quantity);

    const result = await Inventory.updateOne(
      {
        productId,
        warehouseId: warehouseObjectId,
        reservedQty: { $gte: qty },
      },
      {
        $inc: {
          reservedQty: -qty,
          shippedQty: qty,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Not enough reserved stock");
    }
  }
}

/* ================= DELIVER ================= */
export async function deliverStock(items, warehouseId) {
  const warehouseObjectId = toObjectId(warehouseId);

  for (const item of items) {
    const productId = toObjectId(item.productId || item.product);
    const qty = Number(item.quantity);

    await Inventory.updateOne(
      { productId, warehouseId: warehouseObjectId },
      {
        $inc: { shippedQty: -qty },
      }
    );
  }
}
