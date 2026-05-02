import { sendWhatsAppMessage } from "@/lib/whatsapp/meta";

export async function handleOrderDispatched(order) {
  try {
    const phone = order.address?.phone;

    if (!phone) return;

    const message = `
Your order has been shipped 🚚

Order ID: ${order.orderId}
Invoice No: ${order.invoice?.invoiceNumber || "Generating..."}

We will share tracking soon.
`;

    await sendWhatsAppMessage({
      to: phone,
      message,
    });

  } catch (err) {
    console.error("handleOrderDispatched error:", err);
  }
}
