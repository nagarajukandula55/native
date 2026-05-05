import Order from "@/models/Order";
import { generateOrderId } from "@/lib/orderId";

export async function createOrderSafe({
  items = [],
  address = {},
  amount = 0,
  paymentMethod = "UNKNOWN",
  userId = null,
}) {
  /* ================= SANITIZE ITEMS ================= */
  const safeItems = items.map((i) => ({
    productId: i.productId,
    productKey: i.productKey || "",
    name: i.name || "",
    image: i.image || "",

    price: Number(i.price || 0),
    qty: Number(i.qty || 1),

    gstPercent: Number(i.gstPercent || 0),

    baseAmount: Number(i.baseAmount || 0),
    discountAmount: Number(i.discountAmount || 0),
    taxableAmount: Number(i.taxableAmount || 0),

    cgst: Number(i.cgst || 0),
    sgst: Number(i.sgst || 0),
    igst: Number(i.igst || 0),

    total: Number(i.total || 0),

    snapshot: i.snapshot || {},
  }));

  /* ================= BILLING ================= */
  const subtotal = safeItems.reduce((a, b) => a + b.baseAmount, 0);
  const totalGST = safeItems.reduce(
    (a, b) => a + b.cgst + b.sgst + b.igst,
    0
  );

  const billing = {
    currency: "INR",
    subtotal,
    discount: 0,
    taxableAmount: subtotal,
    cgst: safeItems.reduce((a, b) => a + b.cgst, 0),
    sgst: safeItems.reduce((a, b) => a + b.sgst, 0),
    igst: safeItems.reduce((a, b) => a + b.igst, 0),
    totalGST,
    roundOff: 0,
    grandTotal: amount,
    locked: true,
  };

  /* ================= ORDER ================= */
  const order = await Order.create({
    userId,
    orderId: await generateOrderId(),

    items: safeItems,
    billing,
    amount,

    status: "PENDING_PAYMENT",

    address: {
      name: address.name || "",
      phone: address.phone || "",
      email: address.email || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      gstNumber: address.gstNumber || "",
      gstType: address.gstNumber ? "B2B" : "B2C",
    },

    payment: {
      method: paymentMethod,
      status: "PENDING",
      amountPaid: 0,
      logs: [],
    },

    auditLogs: [
      {
        action: "ORDER_CREATED",
        by: "SYSTEM",
      },
    ],
  });

  return order;
}
