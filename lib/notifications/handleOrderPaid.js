import { sendWhatsAppMessage } from "@/lib/whatsapp/meta";

export async function handleOrderPaid(order) {
  try {
    const phone = order.address?.phone;

    if (!phone) return;

    const message = `
Payment Successful ✅

Order ID: ${order.orderId}
Receipt No: ${order.receipt?.receiptNumber}
Amount Paid: ₹${order.amount}

Thank you for shopping with us.
`;

    await sendWhatsAppMessage({
      to: phone,
      message,
    });

  } catch (err) {
    console.error("handleOrderPaid error:", err);
  }
}
