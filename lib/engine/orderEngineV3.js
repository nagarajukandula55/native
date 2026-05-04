import Product from "@/models/Product";

export async function buildOrderItems(cart) {
  const items = [];

  for (const item of cart) {
    const product =
      (await Product.findById(item.productId).lean()) ||
      (await Product.findOne({ productKey: item.productId }).lean());

    if (!product) continue;

    const qty = Math.max(item.qty || 1, 1);

    const price =
      product?.primaryVariant?.sellingPrice ||
      product?.price ||
      0;

    items.push({
      productId: product._id,
      productKey: product.productKey,
      name: product.name,
      image: product.primaryImage || "",
      price,
      qty,
      baseAmount: price * qty,
      gstPercent: product.tax || 0,
      total: 0,
    });
  }

  return items;
}
