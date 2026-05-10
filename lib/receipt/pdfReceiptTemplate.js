export const renderReceiptPDF = (doc, data, company) => {
  /* ================= HEADER ================= */

  doc.fontSize(18).text(company?.companyName || "Native Store", 40, 40);
  doc.fontSize(10).text(company?.gstin || "", 40, 60);

  doc.fontSize(16).text("PAYMENT RECEIPT", 380, 40);

  /* ================= DETAILS ================= */

  doc.moveDown();

  doc.fontSize(10);

  doc.text(`Order ID: ${data.orderId}`);
  doc.text(`Transaction ID: ${data.transactionId}`);
  doc.text(`Payment Method: ${data.method}`);
  doc.text(`Paid At: ${new Date(data.paidAt).toLocaleString()}`);

  doc.moveDown();

  /* ================= CUSTOMER ================= */

  doc.text(`Customer: ${data.customer?.name}`);
  doc.text(data.customer?.phone);
  doc.text(data.customer?.address);

  doc.moveDown();

  /* ================= AMOUNT ================= */

  doc.fontSize(14);
  doc.text(`AMOUNT PAID: ₹${data.amountPaid.toFixed(2)}`, {
    align: "right",
  });

  doc.moveDown(2);

  /* ================= FOOTER ================= */

  doc.fontSize(10);
  doc.text("This is a system generated payment receipt.", 40, 750);

  doc.text("Authorized Signatory", 400, 750);
};
