function strip(obj, allowed) {
  const out = {};
  for (const k of allowed) {
    if (obj?.[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

export async function createOrderSafe(raw) {
  console.log("🛡️ SAFE LAYER INPUT:", raw);

  const items = (raw.items || []).map((i, idx) => {
    const clean = strip(i, [
      "productId",
      "productKey",

      // ✅ FIX START
      "name",
      "image",
      // ✅ FIX END

      "qty",
      "price",
      "gstPercent",
      "baseAmount",
      "taxableAmount",
      "cgst",
      "sgst",
      "igst",
      "total",
    ]);

    console.log(`🧾 ITEM ${idx}:`, clean);
    return clean;
  });

  const order = {
    orderId: raw.orderId,
    items,
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

    payment: {
      method: raw.paymentMethod || "UNKNOWN",
      status: "PENDING",
    },

    status: "PENDING_PAYMENT",

    auditLogs: [
      {
        action: "ORDER_CREATED",
        by: "SYSTEM",
      },
    ],
  };

  console.log("📦 FINAL ORDER OBJECT:", order);

  const created = await Order.create(order);

  console.log("✅ ORDER CREATED:", created.orderId);

  return created;
}
