import { sendWhatsAppMessage } from "@/lib/whatsapp/meta";
import { sendPaymentReceipt, sendDispatchedInvoice } from "./email";

/* ================= MASTER NOTIFICATION ENGINE ================= */
export async function notifyOrderEvent(order, prevStatus = null) {
  try {
    const phone = order.address?.phone;
    const email = order.address?.email;

    /* ================= PAID EVENT ================= */
    if (order.status === "PAID" && prevStatus !== "PAID") {

      // 📲 WhatsApp - Payment success
      if (phone) {
        const message = `
💰 Payment Successful

Order ID: ${order.orderId}
Amount Paid: ₹${order.amount}

Thank you for shopping with us ❤️
        `;

        await sendWhatsAppMessage({
          to: phone,
          message,
        });
      }

      // 📧 Email - Receipt
      if (email) {
        await sendPaymentReceipt(order);
      }
    }

    /* ================= DISPATCHED EVENT ================= */
    if (order.status === "DISPATCHED" && prevStatus !== "DISPATCHED") {

      // 📲 WhatsApp - Shipping update
      if (phone) {
        const message = `
🚚 Your order has been shipped

Order ID: ${order.orderId}
Invoice No: ${order.invoice?.invoiceNumber || "Generating..."}

We will share tracking details soon.
        `;

        await sendWhatsAppMessage({
          to: phone,
          message,
        });
      }

      // 📧 Email - Dispatch invoice
      if (email) {
        await sendDispatchedInvoice(order);
      }
    }

  } catch (err) {
    console.error("notifyOrderEvent error:", err);
  }
}
