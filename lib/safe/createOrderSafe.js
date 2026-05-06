import Order from "@/models/Order";

function strip(obj, allowed) {
  const out = {};
  for (const k of allowed) {
    if (obj?.[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

export async function createOrderSafe(raw) {
  try {
    console.log("🛡️ SAFE LAYER INPUT:", raw);

    if (!raw?.orderId) {
      throw new Error("Missing orderId");
    }

    const items = (raw.items || []).map((i, idx) => {
      const clean = strip(i, [
        "productId",
        "productKey",
        "name",
        "image",
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

      if (!clean.productId) {
        console.warn("⚠️ Missing productId in item:", i);
      }

      return {
        ...clean,
        qty: Number(clean.qty || 1),
        price: Number(clean.price || 0),
      };
    });

    if (!items.length) {
      throw new Error("No valid items in order");
    }

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
          at: new Date(),
        },
      ],
    };

    console.log("📦 FINAL ORDER OBJECT:", JSON.stringify(order, null, 2));

    const created = await Order.create(order);

    if (!created) {
      throw new Error("Order creation returned null");
    }

    console.log("✅ ORDER CREATED:", created.orderId);

    return created;

  } catch (err) {
    console.error("🔥 createOrderSafe FAILED:", err.message);
    console.error(err);

    throw new Error("Order creation failed: " + err.message);
  }
}
