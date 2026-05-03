import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { sendInvoiceEmail } from "@/lib/notifications/email";

export async function POST(req) {
  await dbConnect();

  const { id } = await req.json();

  const order = await Order.findById(id);

  if (!order) {
    return Response.json({ success: false }, { status: 404 });
  }

  await sendInvoiceEmail(order);

  order.invoiceSentAt = new Date();
  await order.save();

  return Response.json({ success: true });
}
