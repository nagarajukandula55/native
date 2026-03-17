import Inventory from "@/models/Inventory";

export async function allocateWarehouse(skuId, qty) {
  const stocks = await Inventory.find({
    skuId,
    availableQty: { $gte: qty },
  }).sort({ availableQty: -1 });

  if (!stocks.length)
    throw new Error("Out of stock");

  return stocks[0].warehouseId;
}
