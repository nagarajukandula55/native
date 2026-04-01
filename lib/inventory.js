import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= GET INVENTORY ================= */
async function getInventory(productId, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  let inv = await Inventory.findOne({ productId, warehouseId: wid });

  if (!inv) {
    inv = await Inventory.create({
      productId,
      warehouseId: wid,
      availableQty: 0,
      reservedQty: 0,
      shippedQty: 0,
    });
  }

  return inv;
}

/* ================= RESERVE ================= */
export async function reserveStock(items, warehouseId) {
  for (const item of items) {
    const productId = item.productId || item.product;

    const inv = await getInventory(productId, warehouseId);

    if (inv.availableQty < item.quantity) {
      throw new Error(`Out of stock for ${productId}`);
    }

    await Inventory.updateOne(
      { _id: inv._id, availableQty: { $gte: item.quantity } },
      {
        $inc: {
          availableQty: -item.quantity,
          reservedQty: item.quantity,
        },
      }
    );
  }
}

/* ================= RELEASE ================= */
export async function releaseStock(items, warehouseId) {
  for (const item of items) {
    const productId = item.productId || item.product;

    const inv = await getInventory(productId, warehouseId);

    await Inventory.updateOne(
      { _id: inv._id },
      {
        $inc: {
          availableQty: item.quantity,
          reservedQty: -item.quantity,
        },
      }
    );
  }
}

/* ================= SHIP ================= */
export async function shipStock(items, warehouseId) {
  for (const item of items) {
    const productId = item.productId || item.product;

    const inv = await getInventory(productId, warehouseId);

    if (inv.reservedQty < item.quantity) {
      throw new Error(`Reserved stock mismatch for ${productId}`);
    }

    await Inventory.updateOne(
      { _id: inv._id },
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
    const productId = item.productId || item.product;

    const inv = await getInventory(productId, warehouseId);

    await Inventory.updateOne(
      { _id: inv._id },
      {
        $inc: {
          shippedQty: -item.quantity,
        },
      }
    );
  }
}
