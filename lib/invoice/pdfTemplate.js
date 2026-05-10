export const renderInvoicePDF = (doc, data, company) => {
  const { order, items, subtotal, cgst, sgst, igst, grandTotal, isB2B } = data;

  /* ================= HEADER ================= */

  doc.fontSize(18).text(company?.companyName || "Native", 40, 40);
  doc.fontSize(10).text(company?.gstin || "", 40, 60);

  doc.fontSize(16).text("TAX INVOICE", 400, 40);

  /* ================= CUSTOMER ================= */

  doc.moveDown();

  doc.fontSize(10);
  doc.text(`Bill To: ${order.address?.name}`);
  doc.text(order.address?.phone);
  doc.text(order.address?.address);

  if (isB2B) {
    doc.text(`GSTIN: ${order.address?.gstNumber}`);
  }

  /* ================= TABLE HEADER ================= */

  let y = doc.y + 20;

  doc.fontSize(10);

  doc.text("#", 40, y);
  doc.text("Item", 60, y);
  doc.text("HSN", 200, y);
  doc.text("Qty", 260, y);
  doc.text("Rate", 310, y);
  doc.text("GST%", 370, y);
  doc.text("Total", 450, y);

  y += 20;

  /* ================= ITEMS ================= */

  items.forEach((it, i) => {
    doc.text(i + 1, 40, y);
    doc.text(it.name, 60, y);
    doc.text(it.hsn, 200, y);
    doc.text(it.qty, 260, y);
    doc.text(it.rate, 310, y);
    doc.text(it.gstPercent + "%", 370, y);
    doc.text(it.total.toFixed(2), 450, y);

    y += 18;
  });

  /* ================= TOTAL ================= */

  y += 20;

  doc.fontSize(10);

  doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 350, y);
  doc.text(`CGST: ₹${cgst.toFixed(2)}`, 350, y + 15);
  doc.text(`SGST: ₹${sgst.toFixed(2)}`, 350, y + 30);

  doc.fontSize(12);
  doc.text(`GRAND TOTAL: ₹${grandTotal.toFixed(2)}`, 350, y + 55);

  /* ================= FOOTER ================= */

  doc.fontSize(9);
  doc.text("This is a system generated GST invoice.", 40, 750);
  doc.text("Authorized Signatory", 400, 750);
};
