import { sendWhatsAppInvoice } from "@/lib/notifications/whatsapp";

export async function POST(req) {
  const { id } = await req.json();

  const order = await Order.findById(id);

  await sendWhatsAppInvoice(order);

  return Response.json({ success: true });
}
