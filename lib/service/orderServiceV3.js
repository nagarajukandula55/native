import { OrderV3Schema } from "@/lib/validators/orderV3";
import { sanitizeOrderV3 } from "@/lib/safe/sanitizeV3";
import { buildOrderItems } from "@/lib/engine/orderEngineV3";
import { writeOrderV3 } from "@/lib/engine/writeOrderV3";
import { generateOrderId } from "@/lib/orderId";

export async function createOrderV3(raw) {
  // 1. sanitize
  const clean = sanitizeOrderV3(raw);

  // 2. validate
  const parsed = OrderV3Schema.safeParse(clean);
  if (!parsed.success) {
    throw new Error("Invalid order payload");
  }

  const data = parsed.data;

  // 3. build items (DB-safe)
  const items = await buildOrderItems(data.cart);

  if (!items.length) {
    throw new Error("No valid products found");
  }

  // 4. calculate total
  const amount = data.amount;

  // 5. build final order
  const order = {
    orderId: await generateOrderId(),
    items,
    amount,
    address: data.address,
    status: "PENDING_PAYMENT",
    payment: {
      method: data.paymentMethod,
    },
  };

  // 6. DB write (STRICT SAFE)
  return await writeOrderV3(order);
}
