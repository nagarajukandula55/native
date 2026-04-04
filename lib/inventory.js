import mongoose from "mongoose";
import Inventory from "@/models/Inventory";
import Warehouse from "@/models/Warehouse";

/* ================= ALLOCATE + RESERVE ================= */
export async function allocateAndReserveStock(items) {
  const allocations = [];

  for (const item of items) {
    let remainingQty = item.quantity;

    /* 🔥 GET ALL WAREHOUSES WITH STOCK */
    const inventories = await Inventory.find({
      productId: item.productId,
      availableQty: { $gt: 0 },
    })
      .populate("warehouseId")
      .sort({ "warehouseId.priority": 1 });

    if (!inventories.length) {
      throw new Error(`No stock available for product ${item.productId}`);
    }

    for (const inv of inventories) {
      if (remainingQty <= 0) break;

      const available = inv.availableQty;

      if (available <= 0) continue;

      const allocateQty = Math.min(available, remainingQty);

      /* 🔒 ATOMIC UPDATE */
      const result = await Inventory.updateOne(
        {
          _id: inv._id,
          availableQty: { $gte: allocateQty },
        },
        {
          $inc: {
            availableQty: -allocateQty,
            reservedQty: allocateQty,
          },
        }
      );

      if (result.modifiedCount === 0) {
        continue; // retry next warehouse
      }

      allocations.push({
        productId: item.productId,
        warehouseId: inv.warehouseId._id,
        quantity: allocateQty,
      });

      remainingQty -= allocateQty;
    }

    /* ❌ STILL NOT FULFILLED */
    if (remainingQty > 0) {
      throw new Error(`Insufficient stock for product ${item.productId}`);
    }
  }

  return allocations;
}

/* ================= SHIP ================= */
export async function shipStock(allocations) {
  for (const item of allocations) {
    await Inventory.updateOne(
      {
        productId: item.productId,
        warehouseId: item.warehouseId,
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
export async function deliverStock(allocations) {
  for (const item of allocations) {
    await Inventory.updateOne(
      {
        productId: item.productId,
        warehouseId: item.warehouseId,
      },
      {
        $inc: {
          shippedQty: -item.quantity,
        },
      }
    );
  }
}
