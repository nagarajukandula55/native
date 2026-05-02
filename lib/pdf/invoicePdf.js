import PDFDocument from "pdfkit";

/* ================= HELPER ================= */
function money(v) {
  return `₹${(v || 0).toFixed(2)}`;
}

export async function generateInvoicePDF(order) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const company = order.company || {}; // 🔥 from DB

      /* ================= LOGO ================= */
      let logo = null;
      try {
        const res = await fetch(company.logo || "https://shopnative.in/logo.png");
        const arr = await res.arrayBuffer();
        logo = Buffer.from(arr);
      } catch (e) {
        console.log("Logo load failed");
      }

      /* ================= HEADER ================= */
      if (logo) {
        doc.image(logo, 40, 40, { width: 110 });
      }

      doc
        .fontSize(16)
        .text(company.name || "Your Company", 160, 40);

      doc
        .fontSize(10)
        .fillColor("gray")
        .text(company.tagline || "", 160, 60);

      doc.moveTo(40, 90).lineTo(550, 90).stroke();

      /* ================= INVOICE META ================= */
      doc
        .fontSize(11)
        .fillColor("black")
        .text("INVOICE", 400, 40);

      doc
        .fontSize(9)
        .text(`Invoice No: ${order.invoice?.invoiceNumber || "NA"}`, 400, 60)
        .text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 400, 75)
        .text(`Order ID: ${order.orderId}`, 400, 90);

      /* ================= COMPANY DETAILS ================= */
      doc
        .fontSize(10)
        .text(company.address || "", 40, 110)
        .text(`GSTIN: ${company.gst || "NA"}`);

      /* ================= CUSTOMER ================= */
      doc
        .fontSize(11)
        .text("Bill To:", 40, 150);

      doc
        .fontSize(10)
        .text(order.address?.name || "", 40, 165)
        .text(order.address?.phone || "")
        .text(order.address?.address || "")
        .text(`${order.address?.city || ""} - ${order.address?.pincode || ""}`);

      /* ================= TABLE HEADER ================= */
      let y = 240;

      doc
        .fontSize(10)
        .text("Item", 40, y)
        .text("Qty", 300, y)
        .text("Price", 350, y)
        .text("Total", 450, y);

      doc.moveTo(40, y + 12).lineTo(550, y + 12).stroke();

      y += 20;

      /* ================= ITEMS ================= */
      order.items.forEach((item) => {
        doc
          .fontSize(9)
          .text(item.name, 40, y)
          .text(item.qty.toString(), 300, y)
          .text(money(item.price), 350, y)
          .text(money(item.price * item.qty), 450, y);

        y += 18;
      });

      /* ================= CALCULATIONS ================= */
      const subtotal =
        order.items?.reduce((a, b) => a + b.price * b.qty, 0) || 0;

      const discount = order.discount || 0;
      const taxable = subtotal - discount;

      const cgst = order.billing?.cgst || 0;
      const sgst = order.billing?.sgst || 0;
      const igst = order.billing?.igst || 0;

      const total = order.amount;

      y += 10;

      doc.moveTo(300, y).lineTo(550, y).stroke();

      y += 10;

      const right = (label, value) => {
        doc
          .fontSize(10)
          .text(label, 350, y)
          .text(value, 450, y);
        y += 15;
      };

      right("Subtotal", money(subtotal));

      if (discount > 0) {
        right("Discount", `- ${money(discount)}`);
      }

      right("Taxable", money(taxable));

      if (cgst > 0) {
        right("CGST", money(cgst));
        right("SGST", money(sgst));
      }

      if (igst > 0) {
        right("IGST", money(igst));
      }

      doc.moveTo(350, y).lineTo(550, y).stroke();
      y += 10;

      doc
        .fontSize(12)
        .text("TOTAL", 350, y)
        .text(money(total), 450, y);

      /* ================= PAYMENT ================= */
      y += 30;

      doc
        .fontSize(11)
        .text("Payment Details", 40, y);

      y += 15;

      doc
        .fontSize(10)
        .text(`Mode: ${order.payment?.method || "ONLINE"}`, 40, y)
        .text(
          `Reference: ${
            order.payment?.razorpay_payment_id ||
            order.receipt?.paymentReference ||
            "NA"
          }`,
          40,
          y + 15
        );

      /* ================= FOOTER ================= */
      doc
        .fontSize(9)
        .fillColor("gray")
        .text(
          "This is a system generated invoice. No signature required.",
          40,
          750,
          { align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
