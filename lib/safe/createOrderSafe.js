import Order from "@/models/Order";
import { generateOrderId } from "@/lib/orderId";

export async function createOrderSafe(raw) {
  try {
    console.log("🛡️ createOrderSafe INPUT:", JSON.stringify(raw, null, 2));

    const cleanItems = (raw.items || []).map((i, idx) => {
      const item = {
        productId: i.productId,
        productKey: i.productKey,
        name: i.name, // ✅ allowed in your schema
        image: i.image,

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
      };

      console.log(`📦 CLEAN ITEM ${idx}:`, item);
      return item;
    });

    const orderData = {
      orderId: raw.orderId || (await generateOrderId()),
      items: cleanItems,
      amount: Number(raw.amount || 0),

      address: {
        name: raw.address?.name || "",
        phone: raw.address?.phone || "",
        email: raw.address?.email || "",
        address: raw.address?.address || "",
        city: raw.address?.city || "",
        state: raw.address?.state || "",
        pincode: raw.address?.pincode || "",
        gstNumber: raw.address?.gstNumber || "",
      },

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

    console.log("🧾 FINAL ORDER DATA:", JSON.stringify(orderData, null, 2));

    const order = await Order.create(orderData);

    console.log("✅ ORDER SAVED:", order._id);

    return order;

  } catch (err) {
    console.error("❌ createOrderSafe ERROR:", err);
    throw err;
  }
}
