import Order from "@/models/Order";

export async function createOrderInDB(payload) {
  // 🔒 FINAL SAFETY FILTER
  const cleanItems = payload.items.map((i) => ({
    productId: i.productId,
    productKey: i.productKey,
    image: i.image,
    price: i.price,
    qty: i.qty,
    gstPercent: i.gstPercent,
    baseAmount: i.baseAmount,
    total: i.total,
  }));

  return await Order.create({
    orderId: payload.orderId,
    items: cleanItems,
    amount: payload.amount,
    address: payload.address,
    status: "PENDING_PAYMENT",
    payment: {
      method: payload.paymentMethod,
    },
  });
}
