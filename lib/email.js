import nodemailer from "nodemailer";

const transporter =
  nodemailer.createTransport({

    host:
      process.env.SMTP_HOST,

    port:
      Number(
        process.env.SMTP_PORT
      ) || 587,

    secure: false,

    auth: {

      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_PASS,
    },
  });

/* =========================================
   SEND MAIL
========================================= */

export async function sendMail({

  to,
  subject,
  html,
}) {

  return transporter.sendMail({

    from:
      process.env.SMTP_FROM,

    to,

    subject,

    html,
  });
}

/* =========================================
   SHIPMENT CREATED
========================================= */

export async function sendShipmentCreatedEmail({
  to,
  order,
}) {

  return sendMail({

    to,

    subject:
      `Shipment Created - ${order.orderId}`,

    html: `

      <h2>Shipment Created</h2>

      <p>Your shipment has been dispatched.</p>

      <p>
      <b>Order:</b>
      ${order.orderId}
      </p>

      <p>
      <b>AWB:</b>
      ${order.shipping?.awbNumber}
      </p>

      <p>
      <b>Courier:</b>
      ${order.shipping?.courierPartner}
      </p>

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

  return sendMail({

    to,

    subject:
      `Order Delivered - ${order.orderId}`,

    html: `

      <h2>Order Delivered</h2>

      <p>
      Your order has been delivered successfully.
      </p>

      <p>
      Thank you for shopping with us.
      </p>

    `,
  });
}
