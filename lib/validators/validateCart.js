export function validateCart(cart = []) {
  if (!Array.isArray(cart)) {
    console.warn("validateCart: cart is not array", cart);
    return [];
  }

  const cleaned = [];

  for (const item of cart) {
    if (!item) continue;

    const productId =
      item.productId ||
      item._id ||
      item.id;

    if (!productId) {
      console.warn("validateCart: missing productId", item);
      continue;
    }

    const qty = Math.max(Number(item.qty || 1), 1);

    if (!Number.isFinite(qty) || qty <= 0) continue;

    cleaned.push({
      productId: String(productId), // 🔥 normalize type
      qty,
      variant: item.variant || "default",
    });
  }

  return cleaned;
}
