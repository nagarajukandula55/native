import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

export async function createInvoicePDF({
  order,
  company,
  invoiceNumber,
  gst,
  qrImageBuffer,
  invoiceHash,
}) {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 40;

  const drawText = (text, x, size = 10, bold = false) => {
    page.drawText(String(text || "-"), {
      x,
      y,
      size,
      font: bold ? fontBold : fontRegular,
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

  drawText(company.companyName, 110, 16, true);
  drawText(company.tagline || "Eat Healthy, Stay Healthy", 110, y - 20);

  drawText("TAX INVOICE", 420, 14, true);
  drawText(invoiceNumber, 420, y - 20);

  y -= 60;
  line(y);
  y -= 20;

  /* ================= BILL / SHIP / PAYMENT ================= */

  const section = (title, x, data) => {
    drawText(title, x, 12, true);
    let yy = y - 20;

    data.forEach((d) => {
      drawText(d, x, yy);
      yy -= 14;
    });
  };

  section("Bill To", 40, [
    order.address?.name,
    order.address?.phone,
    order.address?.address,
    order.address?.city,
    order.address?.state,
  ]);

  section("Ship To", 200, [
    order.address?.name,
    order.address?.phone,
    order.address?.address,
    order.address?.city,
    order.address?.state,
  ]);

  section("Payment", 360, [
    order.payment?.method,
    order.payment?.status,
    money(order.payment?.amountPaid),
    order.payment?.transactionId,
  ]);

  y -= 110;
  line(y);
  y -= 20;

  /* ================= ITEMS ================= */

  drawText("#  Item  Qty  Rate  GST  Total", 40, 10, true);
  y -= 20;

  let total = 0;

  (order.items || []).forEach((it, i) => {
    const row = `${i + 1}   ${it.name}   ${it.qty}   ${money(
      it.price
    )}   ${it.gstPercent || 0}%   ${money(it.total)}`;

    drawText(row, 40);
    y -= 16;

    total += it.total || 0;
  });

  y -= 10;
  drawText(`Items Total: ${money(total)}`, 40, 11, true);

  /* ================= SUMMARY ================= */

  const sx = 330;
  let sy = y;

  const summary = gst;

  const rows = [
    ["Taxable", summary.taxable],
    ["CGST", summary.cgst],
    ["SGST", summary.sgst],
    ["IGST", summary.igst],
    ["Discount", order.billing?.discount],
    ["Grand Total", order.billing?.grandTotal],
  ];

  drawText("GST Summary", sx, 12, true);

  sy -= 20;

  rows.forEach(([k, v]) => {
    drawText(k, sx, 10);
    drawText(money(v), sx + 120, 10);
    sy -= 14;
  });

  /* ================= QR ================= */

  if (qrImageBuffer) {
    const qrImage = await pdfDoc.embedPng(qrImageBuffer);

    page.drawImage(qrImage, {
      x: 40,
      y: 120,
      width: 70,
      height: 70,
    });
  }

  drawText(`Hash: ${invoiceHash}`, 140, 8);
  drawText(`Generated: ${new Date().toLocaleString()}`, 140, 8);

  /* ================= SIGN ================= */

  const signPath = path.join(process.cwd(), "public/signature.png");

  if (fs.existsSync(signPath)) {
    const sign = await pdfDoc.embedPng(fs.readFileSync(signPath));

    page.drawImage(sign, {
      x: 150,
      y: 120,
      width: 90,
      height: 40,
    });
  }

  drawText(`For ${company.companyName}`, 150, 10, true);

  /* ================= FOOTER ================= */

  drawText(
    "This is a system generated invoice and is valid without signature.",
    40,
    8
  );

  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}
