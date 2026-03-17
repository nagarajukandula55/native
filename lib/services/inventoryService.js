import Inventory from "@/models/Inventory";
import InventoryTxn from "@/models/InventoryTxn";

export async function reserveStock(
  skuId,
  warehouseId,
  qty,
  orderId
) {
  const inv = await Inventory.findOne({
    skuId,
    warehouseId,
  });

  if (!inv) throw new Error("Stock not found");

  if (inv.availableQty < qty)
    throw new Error("Insufficient stock");

  inv.availableQty -= qty;
  inv.reservedQty += qty;

  await inv.save();

  await InventoryTxn.create({
    skuId,
    warehouseId,
    type: "RESERVE",
    quantity: qty,
    referenceType: "ORDER",
    referenceId: orderId,
  });
}
// Deduct Stock
export async function deductReservedStock(
  skuId,
  warehouseId,
  qty,
  orderId
) {
  const inv = await Inventory.findOne({
    skuId,
    warehouseId,
  });

  inv.reservedQty -= qty;

  await inv.save();

  await InventoryTxn.create({
    skuId,
    warehouseId,
    type: "DEDUCT",
    quantity: qty,
    referenceType: "ORDER",
    referenceId: orderId,
  });
}

// Release Stock on Cancellation
export async function releaseReservedStock(
  skuId,
  warehouseId,
  qty,
  orderId
) {
  const inv = await Inventory.findOne({
    skuId,
    warehouseId,
  });

  inv.availableQty += qty;
  inv.reservedQty -= qty;

  await inv.save();

  await InventoryTxn.create({
    skuId,
    warehouseId,
    type: "ADJUSTMENT",
    quantity: qty,
    referenceType: "ORDER_CANCEL",
    referenceId: orderId,
  });
}

