export function sanitizeOrderV3(input) {
  return {
    cart: input.cart || [],
    amount: Number(input.amount || 0),
    paymentMethod: input.paymentMethod || "COD",
    coupon: input.coupon || null,

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
  };
}
