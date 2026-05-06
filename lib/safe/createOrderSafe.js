import Order from "@/models/Order";
import { generateOrderId } from "@/lib/orderId";

function strip(obj, allowed) {
  const out = {};
  for (const k of allowed) {
    if (obj?.[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

export async function createOrderSafe(raw) {
  console.log("🧠 SAFE STEP 1: RAW INPUT:", raw);

  const items = (raw.items || []).map((i, index) => {
    const clean = strip(i, [
      "productId",
      "productKey",
      "name",
      "image",
      "price",
      "qty",
      "gstPercent",
      "baseAmount",
      "discountAmount",
      "taxableAmount",
      "cgst",
      "sgst",
      "igst",
      "total",
    ]);

    console.log(`🧾 SAFE ITEM ${index}:`, clean);
    return clean;
  });

  const order = {
    orderId: raw.orderId || (await generateOrderId()),

    items,

    billing: raw.billing || {},

    amount: Number(raw.amount || 0),

    address: strip(raw.address || {}, [
      "name",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "pincode",
      "gstNumber",
    ]),

    status: "PENDING_PAYMENT",

    payment: {
      method: raw.paymentMethod || "UNKNOWN",
      status: "PENDING",
    },

    auditLogs: [
      {
        action: "ORDER_CREATED",
        by: "SYSTEM",
      },
    ],
  };

  console.log("📦 SAFE STEP 2: FINAL ORDER:", order);

  const created = await Order.create(order);

  console.log("🎯 SAFE STEP 3: SAVED ORDER:", created._id);

  return created;
}
