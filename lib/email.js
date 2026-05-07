import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function sendReceiptEmail({
  to,
  orderId,
  receiptUrl,
}) {

  try {

    await resend.emails.send({

      from: process.env.FROM_EMAIL,

      to,

      subject: `Payment Receipt - ${orderId}`,

      html: `

        <div style="font-family:Arial;padding:20px">

          <h2>
            Payment Received ✅
          </h2>

          <p>
            Your payment has been received successfully.
          </p>

          <p>
            Order ID:
            <b>${orderId}</b>
          </p>

          <a
            href="${receiptUrl}"
            style="
              background:black;
              color:white;
              padding:12px 20px;
              text-decoration:none;
              display:inline-block;
              margin-top:15px;
            "
          >
            Download Receipt
          </a>

        </div>
      `,
    });

  } catch (err) {

    console.log(
      "EMAIL ERROR:",
      err
    );
  }
}
