export async function sendWhatsAppInvoice(order) {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_TOKEN;

    const to = order.address?.phone;

    const message = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: `🧾 Invoice Generated for Order ${order.orderId}
Total: ₹${order.amount}
Receipt: ${order.receipt?.receiptNumber}`,
      },
    };

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    const data = await res.json();

    console.log("WhatsApp response:", data);

    return data;
  } catch (err) {
    console.error("WhatsApp error:", err);
  }
}
