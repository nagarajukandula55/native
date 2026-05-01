import PDFDocument from "pdfkit";
import fs from "fs";

export const generateInvoice = (order) => {
  const doc = new PDFDocument();

  const path = `./public/invoices/${order.orderId}.pdf`;
  doc.pipe(fs.createWriteStream(path));

  doc.fontSize(18).text("TAX INVOICE", { align: "center" });

  doc.text(`Order ID: ${order.orderId}`);
  doc.text(`Customer: ${order.address.name}`);
  doc.text(`GST: ${order.address.gstNumber || "N/A"}`);

  doc.moveDown();

  order.items.forEach((item) => {
    doc.text(
      `${item.name} | HSN: ${item.hsn} | Qty: ${item.qty} | ₹${item.price}`
    );
  });

  doc.moveDown();
  doc.text(`Total: ₹${order.amount}`);

  doc.end();

  return `/invoices/${order.orderId}.pdf`;
};
