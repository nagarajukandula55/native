import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= RESERVE STOCK ================= */
export async function reserveStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId;

    const inv = await Inventory.findOne({
      productId,
      warehouseId: wid,
    });

    if (!inv) {
      throw new Error("Inventory not found");
    }

    if (inv.availableQty < item.quantity) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    const result = await Inventory.updateOne(
      {
        productId,
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
      throw new Error("Stock conflict, try again");
    }
  }
}

/* ================= SHIP STOCK ================= */
export async function shipStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId;

    const result = await Inventory.updateOne(
      {
        productId,
        warehouseId: wid,
        reservedQty: { $gte: item.quantity },
      },
      {
        $inc: {
          reservedQty: -item.quantity,
          shippedQty: item.quantity,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Reserved stock missing");
    }
  }
}

/* ================= DELIVER STOCK ================= */
export async function deliverStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId;

    await Inventory.updateOne(
      {
        productId,
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
