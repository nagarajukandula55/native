export async function sendInvoiceEmail(order) {
  try {
    console.log("📧 Email triggered for order:", order.orderId);

    // TEMP STUB (NO BREAK BUILD)
    // Later you can integrate Resend / Nodemailer / SES

    return true;
  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
}
