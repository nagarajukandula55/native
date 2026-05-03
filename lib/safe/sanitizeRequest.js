export function sanitizeOrderRequest(body = {}) {
  return {
    cart: Array.isArray(body.cart)
      ? body.cart.map((item) => ({
          productId: String(item.productId || ""),
          qty: Math.max(Number(item.qty || 1), 1),
          variant: item.variant || "default",
        }))
      : [],

    address: {
      name: body.address?.name || "",
      phone: body.address?.phone || "",
      email: body.address?.email || "",
      address: body.address?.address || "",
      city: body.address?.city || "",
      state: body.address?.state || "",
      pincode: body.address?.pincode || "",
      gstNumber: body.address?.gstNumber || "",
    },

    coupon: body.coupon || null,
    paymentMethod: body.paymentMethod || "RAZORPAY",
    gstMode: body.gstMode || "CGST_SGST",

    clientAmount: Number(body.amount || 0),
  };
}
