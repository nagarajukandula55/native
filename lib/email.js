import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= SEND ================= */

export async function sendMail({
  to,
  subject,
  html,
  attachments = [],
}) {

  if (!to) return;

  await transporter.sendMail({
    from: `"Native" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
}

/* ================= ORDER MAIL ================= */

export async function sendOrderPlacedEmail(order) {

  return sendMail({
    to: order.address?.email,

    subject:
      `Order Placed - ${order.orderId}`,

    html: `
      <h2>Order Confirmed</h2>

      <p>Dear ${order.address?.name},</p>

      <p>
        Your order has been placed successfully.
      </p>

      <p>
        <b>Order ID:</b> ${order.orderId}
      </p>

      <p>
        <b>Amount:</b> ₹${order.amount}
      </p>
    `,
  });
}

/* ================= RECEIPT ================= */

export async function sendReceiptEmail({
  order,
  pdfBuffer,
}) {

  return sendMail({
    to: order.address?.email,

    subject:
      `Payment Receipt - ${order.receipt?.receiptNumber}`,

    html: `
      <h2>Payment Received</h2>

      <p>
        Your payment has been received successfully.
      </p>

      <p>
        <b>Receipt No:</b>
        ${order.receipt?.receiptNumber}
      </p>
    `,

    attachments: [
      {
        filename:
          `${order.receipt?.receiptNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

/* ================= INVOICE ================= */

export async function sendInvoiceEmail({
  order,
  pdfBuffer,
}) {

  return sendMail({
    to: order.address?.email,

    subject:
      `Invoice - ${order.invoice?.invoiceNumber}`,

    html: `
      <h2>Invoice Attached</h2>

      <p>
        Please find attached invoice for your order.
      </p>

      <p>
        <b>Invoice:</b>
        ${order.invoice?.invoiceNumber}
      </p>
    `,

    attachments: [
      {
        filename:
          `${order.invoice?.invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
