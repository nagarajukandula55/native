import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { generateInvoice } from "@/lib/invoice";

export async function POST(req) {
  await dbConnect();

  const body = await req.text(); // RAW BODY REQUIRED
  const signature = req.headers.get("x-razorpay-signature");

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  const invoiceUrl = generateInvoice(order);
  order.invoiceUrl = invoiceUrl;

  /* ================= PAYMENT SUCCESS ================= */
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    const order = await Order.findOne({
      "payment.razorpay_order_id": payment.order_id,
    });

    if (order) {
      order.status = "PAID";
      order.payment.razorpay_payment_id = payment.id;
      order.payment.paidAt = new Date();

      await order.save();
    }
  }

  return new Response("OK", { status: 200 });
}
