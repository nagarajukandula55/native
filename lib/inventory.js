import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= NORMALIZE ID ================= */
function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

/* ================= RESERVE STOCK ================= */
export async function reserveStock(items, warehouseId) {
  const wid = toObjectId(warehouseId);

  for (const item of items) {
    const pid = toObjectId(item.productId || item._id);

    const inventory = await Inventory.findOne({
      productId: pid,
      warehouseId: wid,
    });

    if (!inventory) {
      throw new Error(`Inventory not found for product ${pid}`);
    }

    if (inventory.availableQty < item.quantity) {
      throw new Error(`Out of stock for product ${pid}`);
    }

    const result = await Inventory.updateOne(
      {
        productId: pid,
        warehouseId: wid,
        availableQty: { $gte: item.quantity },
      },
      {
        $inc: {
          availableQty: -item.quantity,
          reservedQty: item.quantity,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Stock conflict");
    }
  }
}

/* ================= SHIP STOCK ================= */
export async function shipStock(items, warehouseId) {
  const wid = toObjectId(warehouseId);

  for (const item of items) {
    const pid = toObjectId(item.productId || item._id);

    await Inventory.updateOne(
      {
        productId: pid,
        warehouseId: wid,
      },
      {
        $inc: {
          reservedQty: -item.quantity,
          shippedQty: item.quantity,
        },
      }
    );
  }
}

/* ================= DELIVER STOCK ================= */
export async function deliverStock(items, warehouseId) {
  const wid = toObjectId(warehouseId);

  for (const item of items) {
    const pid = toObjectId(item.productId || item._id);

    await Inventory.updateOne(
      {
        productId: pid,
        warehouseId: wid,
      },
      {
        $inc: {
          shippedQty: -item.quantity,
        },
      }
    );
  }
}
