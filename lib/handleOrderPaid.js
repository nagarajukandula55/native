import { generateReceiptNumber } from "@/lib/receipt";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";
import { generateInvoiceHTML } from "@/lib/invoice";

export async function handleOrderPaid(order, paymentData = {}) {
  let changed = false;

  /* ================= PAYMENT ================= */
  order.payment = {
    razorpay_order_id: paymentData.razorpay_order_id,
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_signature: paymentData.razorpay_signature,
    paidAt: new Date(),
    method: paymentData.mode || "ONLINE",
  };

  /* ================= RECEIPT ================= */
  if (!order.receipt?.receiptNumber) {
    order.receipt = {
      receiptNumber: await generateReceiptNumber(),
      generatedAt: new Date(),
      paymentReference:
        paymentData.razorpay_payment_id || "MANUAL",
      amountPaid: order.amount,
    };
    changed = true;
  }

  /* ================= INVOICE ================= */
  if (!order.invoice?.invoiceNumber) {
    order.invoice = {
      invoiceNumber: await generateInvoiceNumber(order.createdAt),
      generatedAt: new Date(),
    };

    order.invoiceHTML = generateInvoiceHTML(order.toObject());
    changed = true;
  }

  return changed;
}
