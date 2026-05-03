export function validateCart(cart = []) {
  const cleaned = [];

  for (const item of cart) {
    const productId = item.productId || item._id;

    if (!productId) continue;

    const qty = Number(item.qty || 1);

    if (qty <= 0) continue;

    cleaned.push({
      productId,
      qty,
      variant: item.variant || "default",
    });
  }

  return cleaned;
}
