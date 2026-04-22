import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function generateSKU(productKey, variant) {
  await dbConnect();

  // Find last SKU for this productKey
  const lastProduct = await Product.findOne({
    productKey: productKey,
  })
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1;

  if (lastProduct?.sku) {
    const parts = lastProduct.sku.split("-");
    const lastNumber = parseInt(parts[2], 10);
    nextNumber = lastNumber + 1;
  }

  const formattedNumber = String(nextNumber).padStart(3, "0");

  return `NA-${productKey}-${formattedNumber}-${variant}`;
}
