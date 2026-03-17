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
