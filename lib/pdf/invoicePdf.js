import PDFDocument from "pdfkit";
import fetch from "node-fetch";

export async function generateInvoicePDF(order) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* ================= LOAD LOGO ================= */
      let logoBuffer = null;
      try {
        const res = await fetch("https://shopnative.in/logo.png");
        logoBuffer = await res.buffer();
      } catch (e) {
        console.error("Logo load failed");
      }

      /* ================= HEADER ================= */
      if (logoBuffer) {
        doc.image(logoBuffer, 40, 40, { width: 100 });
      }

      doc
        .fontSize(18)
        .text("PAYMENT RECEIPT", 0, 50, { align: "center" });

      doc
        .fontSize(10)
        .text("Your Trusted Mobile & Laptop Store", {
          align: "center",
        });

      doc.moveDown(2);

      /* ================= ORDER INFO ================= */
      doc
        .fontSize(10)
        .text(`Order ID: ${order.orderId}`)
        .text(`Receipt: ${order.receipt?.receiptNumber || "N/A"}`)
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

      /* ================= PAYMENT ================= */
      doc.fontSize(12).text("Payment Details", { underline: true });

      doc
        .fontSize(10)
        .text(`Mode: ${order.payment?.method || "ONLINE"}`)
        .text(
          `Reference: ${
            order.payment?.razorpay_payment_id ||
            order.receipt?.paymentReference ||
            "N/A"
          }`
        );

      doc.moveDown();

      /* ================= TABLE ================= */
      doc.fontSize(12).text("Items", { underline: true });
      doc.moveDown(0.5);

      let y = doc.y;

      doc.fontSize(10);
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
        .text(`TOTAL PAID: ₹${order.amount}`, {
          align: "right",
        });

      doc.moveDown(2);

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
