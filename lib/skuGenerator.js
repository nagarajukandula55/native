import Product from "@/models/Product";

export async function generateSKU(productKey, variant) {
  try {
    /* 🔍 FIND LAST SKU */
    const lastProduct = await Product.findOne({
      productKey,
    })
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1;

    if (lastProduct?.sku) {
      const parts = lastProduct.sku.split("-");
      const lastNumber = parseInt(parts[2]) || 0;
      nextNumber = lastNumber + 1;
    }

    /* 🔢 PAD NUMBER */
    const padded = String(nextNumber).padStart(3, "0");

    /* 🔥 FINAL SKU */
    return `NA-${productKey}-${padded}-${variant}`;
  } catch (err) {
    console.error("SKU ERROR:", err);
    throw err;
  }
}
