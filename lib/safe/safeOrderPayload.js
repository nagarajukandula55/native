export function safeOrderPayload(input = {}) {
  return {
    orderId: input.orderId || null,

    items: Array.isArray(input.items)
      ? input.items.map((i) => ({
          productId: String(i.productId || ""),
          name: String(i.name || ""),
          image: String(i.image || ""),
          price: Number(i.price || 0),
          qty: Number(i.qty || 1),
          gstPercent: Number(i.gstPercent || 0),
          baseAmount: Number(i.baseAmount || 0),
        }))
      : [],

    amount: Number(input.amount || 0),

    status: "PENDING_PAYMENT",

    address: {
      name: input.address?.name || "",
      phone: input.address?.phone || "",
      email: input.address?.email || "",
      address: input.address?.address || "",
      city: input.address?.city || "",
      state: input.address?.state || "",
      pincode: input.address?.pincode || "",
      gstNumber: input.address?.gstNumber || "",
    },

    payment: {
      method: input.paymentMethod || "UNKNOWN",
    },

    billing: null,
  };
}
