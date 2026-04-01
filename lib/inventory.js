import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= GET INVENTORY ================= */
async function getInventory(productId, warehouseId) {
  return await Inventory.findOne({
    productId,
    warehouseId,
  });
}

/* ================= RESERVE ================= */
export async function reserveStock(items, warehouseId) {
  for (const item of items) {
    const inventory = await getInventory(item.productId, warehouseId);

    if (!inventory) {
      throw new Error(`Inventory not found for ${item.productId}`);
    }

    if (inventory.availableQty < item.quantity) {
      throw new Error(`Out of stock: ${item.productId}`);
    }

    await Inventory.updateOne(
      {
        productId: item.productId,
        warehouseId,
        availableQty: { $gte: item.quantity },
      },
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
      {
        productId: item.productId,
        warehouseId,
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

/* ================= DELIVER ================= */
export async function deliverStock(items, warehouseId) {
  for (const item of items) {
    await Inventory.updateOne(
      {
        productId: item.productId,
        warehouseId,
      },
      {
        $inc: {
          shippedQty: -item.quantity,
        },
      }
    );
  }
}
