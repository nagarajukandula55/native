import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= HELPER ================= */
function toObjectId(id) {
  if (!id) throw new Error("Invalid ID");

  return typeof id === "string"
    ? new mongoose.Types.ObjectId(id)
    : id;
}

/* ================= RESERVE STOCK ================= */
export async function reserveStock(items, warehouseId) {
  const warehouseObjectId = toObjectId(warehouseId);

  for (const item of items) {
    const productId = toObjectId(item.productId || item.product);
    const qty = Number(item.quantity);

    const inventory = await Inventory.findOne({
      productId,
      warehouseId: warehouseObjectId,
    });

    if (!inventory) {
      throw new Error(`No inventory for product ${productId}`);
    }

    if (inventory.availableQty < qty) {
      throw new Error(
        `Insufficient stock for product ${productId}. Available: ${inventory.availableQty}`
      );
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
      throw new Error("Stock conflict. Please retry.");
    }
  }
}

/* ================= RELEASE STOCK ================= */
export async function releaseStock(items, warehouseId) {
  const warehouseObjectId = toObjectId(warehouseId);

  for (const item of items) {
    const productId = toObjectId(item.productId || item.product);
    const qty = Number(item.quantity);

    await Inventory.updateOne(
      {
        productId,
        warehouseId: warehouseObjectId,
      },
      {
        $inc: {
          availableQty: qty,
          reservedQty: -qty,
        },
      }
    );
  }
}

/* ================= SHIP STOCK ================= */
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
      throw new Error(`Cannot ship product ${productId} - not enough reserved stock`);
    }
  }
}

/* ================= DELIVER STOCK ================= */
export async function deliverStock(items, warehouseId) {
  const warehouseObjectId = toObjectId(warehouseId);

  for (const item of items) {
    const productId = toObjectId(item.productId || item.product);
    const qty = Number(item.quantity);

    await Inventory.updateOne(
      {
        productId,
        warehouseId: warehouseObjectId,
      },
      {
        $inc: {
          shippedQty: -qty,
        },
      }
    );
  }
}
