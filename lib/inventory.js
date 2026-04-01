import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= RESERVE STOCK ================= */
export async function reserveStock(items, warehouseId) {
  const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId;

    const inventory = await Inventory.findOne({
      productId,
      warehouseId: warehouseObjectId,
    });

    if (!inventory) {
      throw new Error(`No inventory for product ${productId}`);
    }

    if (inventory.availableQty < item.quantity) {
      throw new Error(`Out of stock for product ${productId}`);
    }

    const result = await Inventory.updateOne(
      {
        productId,
        warehouseId: warehouseObjectId,
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
      throw new Error("Stock conflict. Try again.");
    }
  }
}

/* ================= SHIP STOCK ================= */
export async function shipStock(items, warehouseId) {
  const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    await Inventory.updateOne(
      {
        productId: item.productId,
        warehouseId: warehouseObjectId,
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
  const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    await Inventory.updateOne(
      {
        productId: item.productId,
        warehouseId: warehouseObjectId,
      },
      {
        $inc: {
          shippedQty: -item.quantity,
        },
      }
    );
  }
}
