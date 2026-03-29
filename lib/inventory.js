import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= SAFE GET OR CREATE ================= */
async function getInventory(productId, warehouseId) {
  let inventory = await Inventory.findOne({ productId, warehouseId });

  if (!inventory) {
    inventory = await Inventory.create({
      productId,
      warehouseId,
      availableQty: 0,
      reservedQty: 0,
      shippedQty: 0,
    });
  }

  return inventory;
}

/* ================= RESERVE ================= */
export async function reserveStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId || item.product;

    const inventory = await getInventory(productId, wid);

    if (inventory.availableQty < item.quantity) {
      throw new Error(`Out of stock for product ${productId}`);
    }

    await Inventory.updateOne(
      { productId, warehouseId: wid },
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
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId || item.product;

    await Inventory.updateOne(
      { productId, warehouseId: wid },
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
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const productId = item.productId || item.product;

    await Inventory.updateOne(
      { productId, warehouseId: wid },
      {
        $inc: {
          shippedQty: -item.quantity,
        },
      }
    );
  }
}
