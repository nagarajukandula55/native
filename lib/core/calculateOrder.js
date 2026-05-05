export function calculateOrder(items, coupon = null) {
  let subtotal = 0;

  for (const item of items) {
    subtotal += item.price * item.qty;
  }

  let discount = 0;

  if (coupon) {
    discount =
      coupon.type === "percent"
        ? (subtotal * coupon.value) / 100
        : coupon.value;
  }

  const taxable = subtotal - discount;

  let totalGST = 0;

  for (const item of items) {
    const base = item.price * item.qty;
    const gst = (base * item.gstPercent) / 100;
    totalGST += gst;
  }

  const total = taxable + totalGST;

  return {
    subtotal,
    discount,
    taxable,
    totalGST,
    total,
  };
}
