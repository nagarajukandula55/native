import Order from "@/models/Order";

export async function createOrder({
  orderId,
  items,
  amount,
  address,
  paymentMethod,
}) {
  /* ================= HARD SANITIZE ================= */
  const cleanItems = items.map((i) => ({
    productId: i.productId,
    productKey: i.productKey || undefined,
    image: i.image || "",
    price: Number(i.price || 0),
    qty: Number(i.qty || 1),
    gstPercent: Number(i.gstPercent || 0),
    baseAmount: Number(i.baseAmount || 0),
    total: Number(i.total || 0),
  }));

  const cleanAddress = {
    name: address?.name || "",
    phone: address?.phone || "",
    email: address?.email || "",
    address: address?.address || "",
    city: address?.city || "",
    state: address?.state || "",
    pincode: address?.pincode || "",
    gstNumber: address?.gstNumber || null,
  };

  /* ================= CREATE ================= */
  const order = await Order.create({
    orderId,
    items: cleanItems,
    amount: Number(amount),
    address: cleanAddress,
    payment: { method: paymentMethod },
  });

  return order;
}
