import { deepSanitize } from "./deepSanitize";
import { ORDER_WHITELIST } from "./orderWhitelist";
import { generateOrderId } from "@/lib/orderId";

function strip(obj, whitelist) {
  const clean = {};

  for (const key in whitelist) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  }

  return clean;
}

export async function buildOrderPayload(input) {
  const cleanInput = deepSanitize(input);

  const safeItems = (cleanInput.items || []).map((i) => ({
    productId: String(i.productId || ""),
    productKey: i.productKey ? String(i.productKey) : undefined,
    qty: Number(i.qty || 1),
    price: Number(i.price || 0),
    gstPercent: Number(i.gstPercent || 0),
    baseAmount: Number(i.baseAmount || 0),
    total: Number(i.total || 0),
    image: i.image ? String(i.image) : "",
  }));

  const payload = {
    orderId: await generateOrderId(),

    items: safeItems,

    amount: Number(cleanInput.amount || 0),

    address: {
      name: cleanInput.address?.name || "",
      phone: cleanInput.address?.phone || "",
      email: cleanInput.address?.email || "",
      address: cleanInput.address?.address || "",
      city: cleanInput.address?.city || "",
      state: cleanInput.address?.state || "",
      pincode: cleanInput.address?.pincode || "",
      gstNumber: cleanInput.address?.gstNumber || null,
    },

    status: "PENDING_PAYMENT",

    payment: {
      method: cleanInput.paymentMethod || "UNKNOWN",
    },
  };

  return strip(payload, ORDER_WHITELIST);
}
