import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= RESERVE STOCK ================= */
export async function reserveStock(items, warehouseId) {
  const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId || item.product;

    const inventory = await Inventory.findOne({
      productId,
      warehouseId: warehouseObjectId,
    });

    if (!inventory) {
      throw new Error("Inventory not found");
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

/* ================= RELEASE STOCK ================= */
export async function releaseStock(items, warehouseId) {
  const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId || item.product;

    await Inventory.updateOne(
      {
        productId,
        warehouseId: warehouseObjectId,
      },
      {
        $inc: {
          availableQty: item.quantity,
          reservedQty: -item.quantity,
        },
      }
    );
  }
}

/* ================= SHIP STOCK ================= */
export async function shipStock(items, warehouseId) {
  const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId || item.product;

    await Inventory.updateOne(
      {
        productId,
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
    const productId = item.productId || item.product;

    await Inventory.updateOne(
      {
        productId,
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
