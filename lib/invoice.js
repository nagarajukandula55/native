import fs from "fs";
import path from "path";

let PDFDocument; // ✅ lazy load

export const generateInvoice = async (order) => {
  try {
    // ✅ Load pdfkit only when needed (fixes build issues)
    if (!PDFDocument) {
      PDFDocument = (await import("pdfkit")).default;
    }

    const invoicesDir = path.join(process.cwd(), "public", "invoices");

    // ✅ Ensure folder exists
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `${order.orderId}.pdf`);

    const doc = new PDFDocument({ margin: 40 });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    /* ================= HEADER ================= */
    doc
      .fontSize(18)
      .text("TAX INVOICE", { align: "center" })
      .moveDown();

    doc.fontSize(10);

    doc.text(`Order ID: ${order.orderId}`);
    doc.text(`Customer: ${order.address?.name || "-"}`);
    doc.text(`Phone: ${order.address?.phone || "-"}`);
    doc.text(`GSTIN: ${order.address?.gstNumber || "N/A"}`);
    doc.moveDown();

    /* ================= ITEMS ================= */
    doc.fontSize(12).text("Items:", { underline: true });
    doc.moveDown(0.5);

    order.items.forEach((item, index) => {
      doc
        .fontSize(10)
        .text(
          `${index + 1}. ${item.name} | HSN: ${
            item.hsn || "NA"
          } | Qty: ${item.qty} | ₹${item.price}`
        );
    });

    doc.moveDown();

    /* ================= TOTAL ================= */
    doc
      .fontSize(12)
      .text(`Total Amount: ₹${order.amount}`, {
        align: "right",
      });

    doc.end();

    // ✅ wait for file to finish writing
    await new Promise((resolve) => stream.on("finish", resolve));

    return `/invoices/${order.orderId}.pdf`;
  } catch (err) {
    console.error("Invoice generation error:", err);
    return null; // don't break order flow
  }
};
