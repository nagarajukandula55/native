import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReceiptEmail({
  to,
  orderId,
  receiptUrl,
}) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject: `Payment Receipt - ${orderId}`,
    html: `
      <h2>Payment Received</h2>

      <p>Your payment was successful.</p>

      <a href="${receiptUrl}">
        Download Receipt
      </a>
    `,
  });
}
