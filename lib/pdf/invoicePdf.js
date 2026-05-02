import PDFDocument from "pdfkit";

export function generateInvoicePDF(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });

      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* ================= HEADER ================= */
      doc
        .fontSize(18)
        .text("PAYMENT RECEIPT", { align: "center" });

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .text(`Order ID: ${order.orderId}`)
        .text(`Date: ${new Date(order.createdAt).toLocaleString()}`)
        .text(`Receipt: ${order.receipt?.receiptNumber || "N/A"}`);

      doc.moveDown();

      /* ================= CUSTOMER ================= */
      doc.fontSize(12).text("Customer Details", { underline: true });

      doc
        .fontSize(10)
        .text(order.address?.name || "")
        .text(order.address?.phone || "")
        .text(order.address?.address || "");

      doc.moveDown();

      /* ================= ITEMS TABLE ================= */
      doc.fontSize(12).text("Items", { underline: true });

      doc.moveDown(0.5);

      const startX = 40;
      let y = doc.y;

      doc.fontSize(10);
      doc.text("Item", startX, y);
      doc.text("Qty", 300, y);
      doc.text("Price", 350, y);
      doc.text("Total", 420, y);

      y += 15;

      order.items.forEach((item) => {
        doc.text(item.name, startX, y);
        doc.text(item.qty.toString(), 300, y);
        doc.text(`₹${item.price}`, 350, y);
        doc.text(`₹${item.price * item.qty}`, 420, y);
        y += 15;
      });

      doc.moveDown();

      /* ================= SUMMARY ================= */
      const billing = order.billing || {};

      doc
        .fontSize(10)
        .text(`Subtotal: ₹${billing.subtotal || order.amount}`, {
          align: "right",
        });

      if (billing.discount > 0) {
        doc.text(`Discount: -₹${billing.discount}`, {
          align: "right",
        });
      }

      if (billing.cgst) {
        doc.text(`CGST: ₹${billing.cgst}`, { align: "right" });
        doc.text(`SGST: ₹${billing.sgst}`, { align: "right" });
      }

      if (billing.igst) {
        doc.text(`IGST: ₹${billing.igst}`, { align: "right" });
      }

      doc
        .fontSize(12)
        .text(`TOTAL: ₹${order.amount}`, {
          align: "right",
        });

      doc.moveDown();

      /* ================= FOOTER ================= */
      doc
        .fontSize(10)
        .text("Thank you for your business!", {
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
