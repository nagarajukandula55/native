import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function sendInvoiceEmail({
  to,
  order,
}) {

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL;

  const invoiceUrl =
    `${siteUrl}/api/invoice/${order.orderId}`;

  const receiptUrl =
    `${siteUrl}/api/receipt/${order.orderId}`;

  await resend.emails.send({

    from: process.env.FROM_EMAIL,

    to,

    subject:
      `Invoice - ${order.invoice.invoiceNumber}`,

    html: `

      <div style="font-family:Arial">

        <h2>
          Invoice Generated ✅
        </h2>

        <p>
          Order:
          ${order.orderId}
        </p>

        <p>
          Invoice No:
          ${order.invoice.invoiceNumber}
        </p>

        <a href="${invoiceUrl}">
          Download Invoice
        </a>

        <br/><br/>

        <a href="${receiptUrl}">
          Download Receipt
        </a>

      </div>
    `,
  });
}
