import PDFDocument from "pdfkit";

export async function generateInvoicePDF(order) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* ================= LOAD LOGO (USING BUILT-IN FETCH) ================= */
      let logoBuffer = null;

      try {
        const res = await fetch("https://shopnative.in/logo.png");
        const arrayBuffer = await res.arrayBuffer();
        logoBuffer = Buffer.from(arrayBuffer);
      } catch (e) {
        console.error("Logo load failed:", e);
      }

      /* ================= HEADER ================= */
      if (logoBuffer) {
        doc.image(logoBuffer, 40, 40, { width: 100 });
      }

      doc
        .fontSize(18)
        .text("INVOICE", 0, 50, { align: "center" });

      doc
        .fontSize(10)
        .text("Your Trusted Mobile & Laptop Store", {
          align: "center",
        });

      doc.moveDown(2);

      /* ================= ORDER ================= */
      doc
        .fontSize(10)
        .text(`Order ID: ${order.orderId}`)
        .text(`Invoice No: ${order.invoice?.invoiceNumber || "NA"}`)
        .text(`Date: ${new Date(order.createdAt).toLocaleString()}`);

      doc.moveDown();

      /* ================= CUSTOMER ================= */
      doc.fontSize(12).text("Customer Details", { underline: true });

      doc
        .fontSize(10)
        .text(order.address?.name || "")
        .text(order.address?.phone || "")
        .text(order.address?.address || "");

      doc.moveDown();

      /* ================= ITEMS ================= */
      doc.fontSize(12).text("Items", { underline: true });
      doc.moveDown(0.5);

      let y = doc.y;

      doc.text("Item", 40, y);
      doc.text("Qty", 300, y);
      doc.text("Price", 350, y);
      doc.text("Total", 420, y);

      y += 15;

      order.items.forEach((item) => {
        doc.text(item.name, 40, y);
        doc.text(item.qty.toString(), 300, y);
        doc.text(`₹${item.price}`, 350, y);
        doc.text(`₹${item.price * item.qty}`, 420, y);
        y += 15;
      });

      doc.moveDown();

      /* ================= BILLING ================= */
      const subtotal =
        order.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;

      const discount = order.discount || 0;
      const taxable = subtotal - discount;

      doc.text(`Subtotal: ₹${subtotal}`, { align: "right" });

      if (discount > 0) {
        doc.text(`Discount: -₹${discount}`, { align: "right" });
      }

      doc.text(`Taxable: ₹${taxable}`, { align: "right" });

      if (order.billing?.cgst) {
        doc.text(`CGST: ₹${order.billing.cgst}`, { align: "right" });
        doc.text(`SGST: ₹${order.billing.sgst}`, { align: "right" });
      }

      if (order.billing?.igst) {
        doc.text(`IGST: ₹${order.billing.igst}`, { align: "right" });
      }

      doc
        .fontSize(12)
        .text(`TOTAL: ₹${order.amount}`, {
          align: "right",
        });

      doc.moveDown(2);

      /* ================= FOOTER ================= */
      doc
        .fontSize(10)
        .text("This is a system generated invoice.", {
          align: "center",
        });

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}
