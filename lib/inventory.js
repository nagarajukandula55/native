import mongoose from "mongoose";
import Inventory from "@/models/Inventory";

/* ================= RESERVE STOCK ================= */
export async function reserveStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {

    const pid = new mongoose.Types.ObjectId(item.productId);

    const inventory = await Inventory.findOne({
      productId: pid,
      warehouseId: wid,
    });

    if (!inventory) {
      throw new Error(`No inventory for product ${pid}`);
    }

    if (inventory.availableQty < item.quantity) {
      throw new Error(`Out of stock`);
    }

    inventory.availableQty -= item.quantity;
    inventory.reservedQty += item.quantity;

    await inventory.save();
  }
}

/* ================= SHIP ================= */
export async function shipStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {

    const pid = new mongoose.Types.ObjectId(item.productId);

    const inventory = await Inventory.findOne({
      productId: pid,
      warehouseId: wid,
    });

    if (!inventory || inventory.reservedQty < item.quantity) {
      throw new Error("Reserved stock not available");
    }

    inventory.reservedQty -= item.quantity;
    inventory.shippedQty += item.quantity;

    await inventory.save();
  }
}

/* ================= DELIVER ================= */
export async function deliverStock(items, warehouseId) {
  const wid = new mongoose.Types.ObjectId(warehouseId);

  for (const item of items) {

    const pid = new mongoose.Types.ObjectId(item.productId);

    const inventory = await Inventory.findOne({
      productId: pid,
      warehouseId: wid,
    });

    if (!inventory || inventory.shippedQty < item.quantity) {
      throw new Error("Shipped stock not available");
    }

    inventory.shippedQty -= item.quantity;

    await inventory.save();
  }
}
