export function safeOrderPayload(input = {}) {
  const safeNumber = (n, fallback = 0) => {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
  };

  const safeString = (s) =>
    typeof s === "string" ? s.trim() : "";

  const items = Array.isArray(input.items)
    ? input.items
        .map((i) => {
          const productId = safeString(i.productId);

          // ❌ HARD GUARD: skip invalid items
          if (!productId) return null;

          return {
            productId,

            // optional fallback fields
            productKey: safeString(i.productKey || ""),
            name: safeString(i.name),
            image: safeString(i.image),

            price: safeNumber(i.price),
            qty: Math.max(1, safeNumber(i.qty, 1)),

            gstPercent: safeNumber(i.gstPercent),
            baseAmount: safeNumber(i.baseAmount),
          };
        })
        .filter(Boolean)
    : [];

  return {
    orderId: input.orderId || null,

    items,

    amount: safeNumber(input.amount),

    status: "PENDING_PAYMENT",

    address: {
      name: safeString(input.address?.name),
      phone: safeString(input.address?.phone),
      email: safeString(input.address?.email),
      address: safeString(input.address?.address),
      city: safeString(input.address?.city),
      state: safeString(input.address?.state),
      pincode: safeString(input.address?.pincode),
      gstNumber: safeString(input.address?.gstNumber),
    },

    payment: {
      method: safeString(input.paymentMethod || "UNKNOWN"),
    },

    billing: null,
  };
}
