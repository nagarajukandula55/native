export function mapProductToOrderItem(product, qty) {
  const price =
    product?.primaryVariant?.sellingPrice ||
    product?.pricing?.sellingPrice ||
    product?.price ||
    0;

  const gstPercent = product?.tax || 0;

  const baseAmount = price * qty;

  return {
    productId: product._id,
    productKey: product.productKey || null,
    image: product.primaryImage || "",
    price,
    qty,
    gstPercent,
    baseAmount,
    total: 0,
  };
}
