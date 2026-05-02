import jsPDF from "jspdf";

export function generateReceiptPDF(order) {
  const doc = new jsPDF();

  /* ================= BASIC SETUP ================= */
  let y = 15;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("PAYMENT RECEIPT", 105, y, { align: "center" });

  y += 10;

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");

  /* ================= ORDER DETAILS ================= */
  doc.text(`Order ID: ${order.orderId}`, 14, y);
  y += 6;
  doc.text(`Status: ${order.status}`, 14, y);
  y += 6;
  doc.text(
    `Date: ${new Date(order.createdAt).toLocaleString()}`,
    14,
    y
  );

  y += 10;

  /* ================= CUSTOMER ================= */
  doc.setFont("Helvetica", "bold");
  doc.text("Customer Details", 14, y);
  y += 6;

  doc.setFont("Helvetica", "normal");
  doc.text(order.address?.name || "-", 14, y);
  y += 5;
  doc.text(order.address?.phone || "-", 14, y);
  y += 5;
  doc.text(order.address?.address || "-", 14, y);

  y += 10;

  /* ================= PAYMENT ================= */
  doc.setFont("Helvetica", "bold");
  doc.text("Payment Details", 14, y);
  y += 6;

  doc.setFont("Helvetica", "normal");

  const paymentMode =
    order.payment?.method ||
    (order.payment?.razorpay_payment_id ? "ONLINE" : "MANUAL");

  doc.text(`Mode: ${paymentMode}`, 14, y);
  y += 5;

  doc.text(
    `Reference: ${
      order.payment?.razorpay_payment_id ||
      order.receipt?.paymentReference ||
      "N/A"
    }`,
    14,
    y
  );

  y += 5;

  doc.text(
    `Receipt No: ${order.receipt?.receiptNumber || "N/A"}`,
    14,
    y
  );

  y += 10;

  /* ================= ITEMS ================= */
  doc.setFont("Helvetica", "bold");
  doc.text("Items", 14, y);
  y += 6;

  doc.setFont("Helvetica", "normal");

  let subtotal = 0;

  order.items?.forEach((item) => {
    const total = item.price * item.qty;
    subtotal += total;

    doc.text(
      `${item.name} (x${item.qty}) - ₹${total}`,
      14,
      y
    );

    y += 5;
  });

  y += 5;

  /* ================= SUMMARY ================= */
  const discount = order.discount || 0;
  const net = subtotal - discount;
  const total = order.amount;

  doc.text(`Subtotal: ₹${subtotal}`, 14, y);
  y += 5;

  if (discount > 0) {
    doc.text(`Discount: -₹${discount}`, 14, y);
    y += 5;
  }

  doc.text(`Net Amount: ₹${net}`, 14, y);
  y += 6;

  doc.setFont("Helvetica", "bold");
  doc.text(`Total Paid: ₹${total}`, 14, y);

  y += 12;

  /* ================= FOOTER ================= */
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Thank you for your purchase",
    105,
    y,
    { align: "center" }
  );

  /* ================= SAVE ================= */
  doc.save(`Receipt-${order.orderId}.pdf`);
}
