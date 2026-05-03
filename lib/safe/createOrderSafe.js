import Order from "@/models/Order";
import { generateOrderId } from "@/lib/orderId";
import { OrderSchema } from "@/lib/validators/orderValidator";

/* ================= STRICT FIELD FIREWALL ================= */
const ROOT_WHITELIST = [
  "orderId",
  "items",
  "amount",
  "address",
  "status",
  "payment",
];

const ADDRESS_WHITELIST = [
  "name",
  "phone",
  "email",
  "address",
  "city",
  "state",
  "pincode",
  "gstNumber",
];

const ITEM_WHITELIST = [
  "productId",
  "productKey",
  "qty",
  "price",
  "gstPercent",
  "baseAmount",
  "total",
  "image",
];

/* ================= SAFE STRIP ================= */
function pick(obj, allowed = []) {
  const out = {};
  for (const k of allowed) {
    if (obj?.[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/* ================= MAIN SAFE ORDER CREATOR ================= */
export async function createOrderSafe(rawBody) {
  if (!rawBody) throw new Error("Empty order payload");

  /* ================= 1. VALIDATE ================= */
  const parsed = OrderSchema.safeParse(rawBody);

  if (!parsed.success) {
    console.error("❌ VALIDATION ERROR:", parsed.error);
    throw new Error("Invalid order payload");
  }

  const data = parsed.data;

  /* ================= 2. FORCE SAFE ITEMS ================= */
  const safeItems = (data.cart || []).map((item) => {
    const cleanItem = pick(item, ITEM_WHITELIST);

    return {
      ...cleanItem,
      qty: Number(cleanItem.qty || 1),
      price: Number(cleanItem.price || 0),
      gstPercent: Number(cleanItem.gstPercent || 0),
      baseAmount: Number(cleanItem.baseAmount || 0),
      total: Number(cleanItem.total || 0),
    };
  });

  /* ================= 3. FORCE SAFE ADDRESS ================= */
  const safeAddress = pick(data.address || {}, ADDRESS_WHITELIST);

  /* ================= 4. FINAL ORDER OBJECT ================= */
  const orderPayload = {
    orderId: await generateOrderId(),

    items: safeItems,
    amount: Number(data.amount || 0),

    address: safeAddress,

    status: "PENDING_PAYMENT",

    payment: {
      method: data.paymentMethod || "UNKNOWN",
    },
  };

  /* ================= 5. HARD FIREWALL (CRITICAL) ================= */
  for (const key of Object.keys(orderPayload)) {
    if (!ROOT_WHITELIST.includes(key)) {
      delete orderPayload[key];
    }
  }

  /* ================= 6. DEBUG (REMOVE LATER) ================= */
  console.log("🔥 ORDER PAYLOAD SAFE:", JSON.stringify(orderPayload, null, 2));

  /* ================= 7. CREATE ORDER ================= */
  const orderDoc = await Order.create({
    orderId: String(await generateOrderId()),
  
    items: safeItems,
  
    amount: Number(data.amount || 0),
  
    address: {
      name: data.address?.name || "",
      phone: data.address?.phone || "",
      email: data.address?.email || "",
      address: data.address?.address || "",
      city: data.address?.city || "",
      state: data.address?.state || "",
      pincode: data.address?.pincode || "",
      gstNumber: data.address?.gstNumber || null,
    },
  
    status: "PENDING_PAYMENT",
  
    payment: {
      method: data.paymentMethod || "UNKNOWN",
    },
  });

  return orderDoc;
}
