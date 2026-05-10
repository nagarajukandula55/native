import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

/* =========================================
   SEND EMAIL
========================================= */

export async function sendEmail({

  to,

  subject,

  html,

}) {

  try {

    if (
      !process.env.RESEND_API_KEY
    ) {

      console.log(
        "❌ RESEND KEY MISSING"
      );

      return;
    }

    const response =
      await resend.emails.send({

        from:
          process.env.EMAIL_FROM ||

          "Native <orders@yourdomain.com>",

        to,

        subject,

        html,
      });

    console.log(
      "✅ EMAIL SENT:",
      response
    );

    return response;

  } catch (err) {

    console.log(
      "EMAIL ERROR:",
      err
    );
  }
}

/* =========================================
   PAYMENT SUCCESS
========================================= */

export async function sendPaymentSuccessEmail({

  to,

  order,

}) {

  return sendEmail({

    to,

    subject:
      `Payment Received - ${order.orderId}`,

    html: `

      <div style="font-family:Arial;padding:20px">

        <h2>
          Payment Received ✅
        </h2>

        <p>
          Your payment has been received successfully.
        </p>

        <p>
          <b>Order ID:</b>
          ${order.orderId}
        </p>

        <p>
          <b>Amount:</b>
          ₹${order.amount}
        </p>

      </div>
    `,
  });
}

/* =========================================
   SHIPMENT CREATED
========================================= */

export async function sendShipmentCreatedEmail({

  to,

  order,

}) {

  return sendEmail({

    to,

    subject:
      `Shipment Created - ${order.orderId}`,

    html: `

      <div style="font-family:Arial;padding:20px">

        <h2>
          Shipment Created 🚚
        </h2>

        <p>
          Your order has been shipped.
        </p>

        <p>
          <b>AWB:</b>
          ${order.shipping?.awbNumber}
        </p>

        <p>
          <b>Courier:</b>
          ${order.shipping?.courierPartner}
        </p>

      </div>
    `,
  });
}

/* =========================================
   DELIVERED
========================================= */

export async function sendShipmentDeliveredEmail({

  to,

  order,

}) {

  return sendEmail({

    to,

    subject:
      `Delivered - ${order.orderId}`,

    html: `

      <div style="font-family:Arial;padding:20px">

        <h2>
          Order Delivered 🎉
        </h2>

        <p>
          Your order has been delivered successfully.
        </p>

        <p>
          <b>Order ID:</b>
          ${order.orderId}
        </p>

      </div>
    `,
  });
}
