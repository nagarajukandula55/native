import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* ================= CORE SENDER ================= */
export async function sendEmail({ to, subject, html }) {
  try {
    const result = await resend.emails.send({
      from: "Native Store <orders@yourdomain.com>",
      to,
      subject,
      html,
    });

    return { success: true, result };
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    return { success: false, error: err.message };
  }
}

/* ================= ORDER INVOICE ================= */
export async function sendInvoiceEmail(order) {
  return sendEmail({
    to: order.address.email,
    subject: `Invoice - ${order.orderId}`,
    html: `
      <div style="font-family:Arial;padding:10px">
        <h2>🧾 Order Confirmed</h2>

        <p><b>Order ID:</b> ${order.orderId}</p>
        <p><b>Amount:</b> ₹${order.amount}</p>

        <hr/>

        <h3>Billing Summary</h3>
        <p>Subtotal: ₹${order.billing.subtotal}</p>
        <p>Discount: ₹${order.billing.discount}</p>
        <p>GST: ₹${order.billing.cgst + order.billing.sgst + order.billing.igst}</p>

        <hr/>

        <p style="color:green">Thanks for shopping with Native Store 🚀</p>
      </div>
    `,
  });
}

/* ================= PAYMENT RECEIPT ================= */
export async function sendPaymentReceipt(order) {
  return sendEmail({
    to: order.address.email,
    subject: `Payment Received - ${order.orderId}`,
    html: `
      <h2>💰 Payment Successful</h2>
      <p>Order ID: ${order.orderId}</p>
      <p>Amount Paid: ₹${order.amount}</p>
      <p>Status: Paid ✅</p>
    `,
  });
}

/* ================= SHIPPING UPDATE ================= */
export async function sendShippingUpdate(order, status) {
  return sendEmail({
    to: order.address.email,
    subject: `Order Update - ${order.orderId}`,
    html: `
      <h2>📦 Shipping Update</h2>
      <p>Order ID: ${order.orderId}</p>
      <p>Status: ${status}</p>
    `,
  });
}
