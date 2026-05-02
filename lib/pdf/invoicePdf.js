import PDFDocument from "pdfkit";
import CompanySettings from "@/models/CompanySettings";

/* ================= FORMAT ================= */
const money = (v) => `₹${(v || 0).toFixed(2)}`;

export async function generateInvoicePDF(order) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* ================= LOAD COMPANY FROM DB ================= */
      const company = await CompanySettings.findOne().lean();

      /* ================= LOAD LOGO ================= */
      let logo = null;
      try {
        if (company?.logo) {
          const res = await fetch(company.logo);
          const arr = await res.arrayBuffer();
          logo = Buffer.from(arr);
        }
      } catch {}

      /* ================= HEADER ================= */
      if (logo) doc.image(logo, 40, 40, { width: 90 });

      doc
        .fontSize(16)
        .text(company?.name || "", 140, 40);

      doc
        .fontSize(10)
        .fillColor("gray")
        .text(company?.tagline || "", 140, 60);

      doc
        .fontSize(9)
        .fillColor("black")
        .text(
          `${company?.address || ""}, ${company?.city || ""} - ${
            company?.pincode || ""
          }`,
          40,
          85
        )
        .text(`GSTIN: ${company?.gst || "NA"}`);

      /* ================= INVOICE META (RIGHT) ================= */
      doc
        .fontSize(12)
        .text("TAX INVOICE", 400, 40, { align: "right" });

      doc
        .fontSize(9)
        .text(`Invoice No: ${order.invoice?.invoiceNumber}`, 400, 60, {
          align: "right",
        })
        .text(
          `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
          400,
          75,
          { align: "right" }
        )
        .text(`Order ID: ${order.orderId}`, 400, 90, {
          align: "right",
        });

      doc.moveTo(40, 110).lineTo(550, 110).stroke();

      /* ================= BILL TO ================= */
      doc
        .fontSize(11)
        .text("Bill To", 40, 120);

      doc
        .fontSize(10)
        .text(order.address?.name || "", 40, 135)
        .text(order.address?.phone || "")
        .text(order.address?.address || "")
        .text(
          `${order.address?.city || ""} - ${order.address?.pincode || ""}`
        );

      /* ================= ITEMS TABLE ================= */
      let y = 220;

      doc
        .fontSize(10)
        .text("Item", 40, y)
        .text("Qty", 300, y)
        .text("Rate", 350, y)
        .text("Amount", 450, y);

      doc.moveTo(40, y + 12).lineTo(550, y + 12).stroke();

      y += 20;

      order.items.forEach((item) => {
        doc
          .fontSize(9)
          .text(item.name, 40, y, { width: 240 })
          .text(item.qty.toString(), 300, y)
          .text(money(item.price), 350, y)
          .text(money(item.price * item.qty), 450, y);

        y += 20;
      });

      /* ================= CALCULATION ================= */
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

      const line = (label, value) => {
        doc
          .fontSize(10)
          .text(label, 350, y)
          .text(value, 450, y);
        y += 15;
      };

      line("Subtotal", money(subtotal));

      if (discount > 0) line("Discount", `- ${money(discount)}`);

      line("Taxable Value", money(taxable));

      if (cgst > 0) {
        line("CGST", money(cgst));
        line("SGST", money(sgst));
      }

      if (igst > 0) {
        line("IGST", money(igst));
      }

      doc.moveTo(350, y).lineTo(550, y).stroke();
      y += 10;

      doc
        .fontSize(12)
        .text("Total", 350, y)
        .text(money(total), 450, y);

      /* ================= PAYMENT ================= */
      y += 40;

      doc
        .fontSize(11)
        .text("Payment Information", 40, y);

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
        .fontSize(8)
        .fillColor("gray")
        .text(
          "This is a computer generated invoice and does not require signature.",
          40,
          770,
          { align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
