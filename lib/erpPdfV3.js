import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const safe = (v) => (v ? String(v) : "-");

export async function createERPInvoicePDF({
  order,
  company,
  invoiceNumber,
  gst,
  qrBuffer,
  invoiceHash,
}) {
  const pdf = await PDFDocument.create();

  const page = pdf.addPage([595, 842]); // A4
  const { height } = page.getSize();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = height - 40;

  const text = (t, x, size = 10, isBold = false) => {
    page.drawText(String(t || "-"), {
      x,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0, 0, 0),
    });
  };

  const line = (yPos) => {
    page.drawLine({
      start: { x: 40, y: yPos },
      end: { x: 555, y: yPos },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
  };

  /* ================= HEADER ================= */

  text(company.companyName, 110, 16, true);
  text(company.tagline || "Eat Healthy, Stay Healthy", 110, 14);

  text("TAX INVOICE", 420, 14, true);
  text(invoiceNumber, 420, 12);

  y -= 60;
  line(y);
  y -= 20;

  /* ================= BILL / SHIP / PAYMENT ================= */

  const block = (title, x, data) => {
    text(title, x, 11, true);
    let yy = y - 20;

    data.forEach((d) => {
      text(d, x, 9);
      yy -= 14;
    });
  };

  block("Bill To", 40, [
    order.address?.name,
    order.address?.phone,
    order.address?.address,
    order.address?.city,
    order.address?.state,
  ]);

  block("Ship To", 200, [
    order.address?.name,
    order.address?.phone,
    order.address?.address,
    order.address?.city,
    order.address?.state,
  ]);

  block("Payment", 360, [
    order.payment?.method,
    order.payment?.status,
    money(order.payment?.amountPaid),
    order.payment?.transactionId,
  ]);

  y -= 110;
  line(y);
  y -= 20;

  /* ================= ITEMS ================= */

  text("# Item Qty Rate GST Total", 40, 10, true);
  y -= 20;

  let itemTotal = 0;

  (order.items || []).forEach((it, i) => {
    const row = `${i + 1} ${it.name} ${it.qty} ${money(
      it.price
    )} ${it.gstPercent || 0}% ${money(it.total)}`;

    text(row, 40);

    itemTotal += it.total || 0;
    y -= 16;
  });

  y -= 10;
  text(`Items Total: ${money(itemTotal)}`, 40, 11, true);

  /* ================= SUMMARY ================= */

  const x = 330;
  let sy = y;

  const rows = [
    ["Taxable", gst.taxable],
    ["CGST", gst.cgst],
    ["SGST", gst.sgst],
    ["IGST", gst.igst],
    ["Discount", order.billing?.discount],
    ["Grand Total", order.billing?.grandTotal],
  ];

  page.drawRectangle({
    x,
    y: sy - 20,
    width: 230,
    height: 150,
    color: rgb(0.97, 0.97, 0.97),
  });

  text("GST Summary", x + 15, 12, true);

  sy -= 40;

  rows.forEach(([k, v]) => {
    text(k, x + 15, 9);
    text(money(v), x + 150, 9);
    sy -= 18;
  });

  /* ================= QR ================= */

  if (qrBuffer) {
    const qr = await pdf.embedPng(qrBuffer);

    page.drawImage(qr, {
      x: 40,
      y: 120,
      width: 70,
      height: 70,
    });
  }

  text(`Hash: ${invoiceHash}`, 140, 8);
  text(`Generated: ${new Date().toLocaleString()}`, 140, 8);

  /* ================= SIGNATURE ================= */

  const signPath = path.join(process.cwd(), "public/signature.png");

  if (fs.existsSync(signPath)) {
    const sign = await pdf.embedPng(fs.readFileSync(signPath));

    page.drawImage(sign, {
      x: 150,
      y: 120,
      width: 90,
      height: 40,
    });
  }

  text(`For ${company.companyName}`, 150, 10, true);

  /* ================= FOOTER ================= */

  text(
    "This invoice is system generated and valid without signature verification.",
    40,
    8
  );

  return await pdf.save();
}
