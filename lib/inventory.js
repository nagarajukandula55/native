import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= RESERVE ================= */
export async function reserveStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const pid = new mongoose.Types.ObjectId(item.productId);

    const inv = await Inventory.findOne({
      productId: pid,
      warehouseId: wid,
    });

    if (!inv) {
      throw new Error(`No inventory for product`);
    }

    if (inv.availableQty < item.quantity) {
      throw new Error(`Out of stock`);
    }

    inv.availableQty -= item.quantity;
    inv.reservedQty += item.quantity;

    await inv.save();
  }
}

/* ================= SHIP ================= */
export async function shipStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const pid = new mongoose.Types.ObjectId(item.productId);

    const inv = await Inventory.findOne({
      productId: pid,
      warehouseId: wid,
    });

    if (!inv || inv.reservedQty < item.quantity) {
      throw new Error("Reserved stock not available");
    }

    inv.reservedQty -= item.quantity;
    inv.shippedQty += item.quantity;

    await inv.save();
  }
}

/* ================= DELIVER ================= */
export async function deliverStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {
    const pid = new mongoose.Types.ObjectId(item.productId);

    const inv = await Inventory.findOne({
      productId: pid,
      warehouseId: wid,
    });

    if (!inv || inv.shippedQty < item.quantity) {
      throw new Error("Shipped stock not available");
    }

    inv.shippedQty -= item.quantity;

    await inv.save();
  }
}
