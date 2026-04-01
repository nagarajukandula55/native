import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= SAFE OBJECT ID ================= */
function toObjectId(id) {
  return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
}

/* ================= RESERVE ================= */
export async function reserveStock(items, warehouseId) {
  const wId = toObjectId(warehouseId);

  for (const item of items) {
    const productId = toObjectId(item.productId || item.product);

    const inventory = await Inventory.findOne({
      productId,
      warehouseId: wId,
    });

    if (!inventory) {
      throw new Error(`Inventory not found for product ${productId}`);
    }

    if (inventory.availableQty < item.quantity) {
      throw new Error(`Out of stock`);
    }

    const res = await Inventory.updateOne(
      {
        productId,
        warehouseId: wId,
        availableQty: { $gte: item.quantity },
      },
      {
        $inc: {
          availableQty: -item.quantity,
          reservedQty: item.quantity,
        },
      }
    );

    if (!res.modifiedCount) {
      throw new Error("Stock conflict");
    }
  }
}

/* ================= SHIP ================= */
export async function shipStock(items, warehouseId) {
  const wId = toObjectId(warehouseId);

  for (const item of items) {
    const productId = toObjectId(item.productId || item.product);

    const inv = await Inventory.findOne({
      productId,
      warehouseId: wId,
    });

    if (!inv || inv.reservedQty < item.quantity) {
      throw new Error("Reserved stock missing");
    }

    await Inventory.updateOne(
      { productId, warehouseId: wId },
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
  const wId = toObjectId(warehouseId);

  for (const item of items) {
    const productId = toObjectId(item.productId || item.product);

    await Inventory.updateOne(
      { productId, warehouseId: wId },
      {
        $inc: {
          shippedQty: -item.quantity,
        },
      }
    );
  }
}
