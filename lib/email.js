import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

/* =========================================
   COMMON EMAIL WRAPPER
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

      return {
        success: false,
        message:
          "RESEND_API_KEY missing",
      };
    }

    if (!to) {

      console.log(
        "❌ EMAIL RECIPIENT MISSING"
      );

      return {
        success: false,
        message:
          "Recipient missing",
      };
    }

    const response =
      await resend.emails.send({

        from:
          process.env.EMAIL_FROM ||

          "Native <orders@yourdomain.com>",

        to:
          Array.isArray(to)
            ? to
            : [to],

        subject,

        html,
      });

    console.log(
      "✅ EMAIL SENT:",
      response
    );

    return {
      success: true,
      data: response,
    };

  } catch (err) {

    console.log(
      "❌ EMAIL ERROR:",
      err
    );

    return {
      success: false,
      error: err?.message,
    };
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

        <p>
          We have started processing your order.
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
          Your order has been shipped successfully.
        </p>

        <p>
          <b>Order ID:</b>
          ${order.orderId}
        </p>

        <p>
          <b>AWB:</b>
          ${
            order.shipping
              ?.awbNumber || "N/A"
          }
        </p>

        <p>
          <b>Courier:</b>
          ${
            order.shipping
              ?.courierPartner || "N/A"
          }
        </p>

      </div>
    `,
  });
}

/* =========================================
   SHIPMENT DELIVERED
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

        <p>
          Thank you for shopping with us.
        </p>

      </div>
    `,
  });
}

/* =========================================
   INVOICE EMAIL
========================================= */

export async function sendInvoiceEmail({

  to,

  order,

  invoiceUrl,

}) {

  return sendEmail({

    to,

    subject:
      `Invoice - ${order.orderId}`,

    html: `

      <div style="font-family:Arial;padding:20px">

        <h2>
          Invoice Generated 📄
        </h2>

        <p>
          Your invoice is ready.
        </p>

        <p>
          <b>Order ID:</b>
          ${order.orderId}
        </p>

        <p>
          <b>Total Amount:</b>
          ₹${order.amount}
        </p>

        ${
          invoiceUrl
            ? `
          <a
            href="${invoiceUrl}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:black;
              color:white;
              text-decoration:none;
              border-radius:8px;
              margin-top:20px;
            "
          >
            Download Invoice
          </a>
        `
            : ""
        }

      </div>
    `,
  });
}

/* =========================================
   RECEIPT EMAIL
========================================= */

export async function sendReceiptEmail({

  to,

  order,

}) {

  return sendEmail({

    to,

    subject:
      `Receipt - ${order.orderId}`,

    html: `

      <div style="font-family:Arial;padding:20px">

        <h2>
          Payment Receipt 🧾
        </h2>

        <p>
          Thank you for your purchase.
        </p>

        <p>
          <b>Order ID:</b>
          ${order.orderId}
        </p>

        <p>
          <b>Amount Paid:</b>
          ₹${order.amount}
        </p>

        <p>
          Your payment was successful.
        </p>

      </div>
    `,
  });
}

/* =========================================
   ORDER CANCELLED
========================================= */

export async function sendOrderCancelledEmail({

  to,

  order,

}) {

  return sendEmail({

    to,

    subject:
      `Order Cancelled - ${order.orderId}`,

    html: `

      <div style="font-family:Arial;padding:20px">

        <h2>
          Order Cancelled ❌
        </h2>

        <p>
          Your order has been cancelled.
        </p>

        <p>
          <b>Order ID:</b>
          ${order.orderId}
        </p>

        <p>
          Refund will be processed if applicable.
        </p>

      </div>
    `,
  });
}

/* =========================================
   REFUND EMAIL
========================================= */

export async function sendRefundEmail({

  to,

  order,

  refundAmount,

}) {

  return sendEmail({

    to,

    subject:
      `Refund Processed - ${order.orderId}`,

    html: `

      <div style="font-family:Arial;padding:20px">

        <h2>
          Refund Processed 💰
        </h2>

        <p>
          Your refund has been initiated successfully.
        </p>

        <p>
          <b>Order ID:</b>
          ${order.orderId}
        </p>

        <p>
          <b>Refund Amount:</b>
          ₹${refundAmount}
        </p>

      </div>
    `,
  });
}
