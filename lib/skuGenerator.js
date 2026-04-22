import Product from "@/models/Product";

export async function generateSKU(productKey, variant) {
  const lastProduct = await Product.findOne({ productKey })
    .sort({ createdAt: -1 })
    .lean();

  let next = 1;

  if (lastProduct?.sku) {
    const match = lastProduct.sku.match(/-(\d{3})-/);
    const last = match ? parseInt(match[1]) : 0;
    next = last + 1;
  }

  const sequence = String(next).padStart(3, "0");

  return `NA-${productKey}-${sequence}-${variant}`;
}
