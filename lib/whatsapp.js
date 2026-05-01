import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

export const sendWhatsApp = async (order) => {
  await client.messages.create({
    from: "whatsapp:+14155238886",
    to: `whatsapp:+91${order.address.phone}`,
    body: `Order Confirmed 🎉

Order ID: ${order.orderId}
Amount: ₹${order.amount}

Track: https://yourdomain.com/track?orderId=${order.orderId}`,
  });
};
