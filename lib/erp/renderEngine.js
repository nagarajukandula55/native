import { PDFDocument, rgb } from "pdf-lib";
import { loadFonts } from "./fontEngine";
import { formatMoney } from "./money";
import { safeText } from "./textSafe";

export async function renderInvoice(data) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);

  const { regular, bold, mode } = await loadFonts(pdf);

  let y = 800;

  const draw = (text, x, size = 10, isBold = false) => {
    page.drawText(safeText(text), {
      x,
      y,
      size,
      font: isBold ? bold : regular,
      color: rgb(0, 0, 0),
    });
  };

  const down = (h = 14) => (y -= h);

  /* ================= HEADER ================= */

  draw(data.company?.companyName, 40, 16, true);
  down();

  draw(
    data.company?.tagline || "Eat Healthy, Stay Healthy",
    40,
    10
  );

  down(25);

  draw("TAX INVOICE", 420, 12, true);
  down();

  draw(data.invoice?.invoiceNumber, 420, 10);
  down(30);

  /* ================= CUSTOMER ================= */

  draw("BILL TO", 40, 11, true);
  down();

  const addr = data.order?.address || {};

  draw(addr.name, 40);
  draw(addr.phone, 40);
  draw(addr.address, 40);

  down(40);

  /* ================= ITEMS ================= */

  const items = Array.isArray(data.order?.items)
    ? data.order.items
    : [];

  draw("ITEMS", 40, 11, true);
  down();

  let total = 0;

  items.forEach((i, idx) => {
    const lineTotal = Number(i?.total || 0);
    total += lineTotal;

    draw(
      `${idx + 1}. ${i?.name || "-"} | Qty:${i?.qty || 0} | ${formatMoney(
        i?.total,
        mode
      )}`,
      40,
      9
    );

    down(12);
  });

  down(10);

  draw(`ITEM TOTAL: ${formatMoney(total, mode)}`, 40, 11, true);

  down(25);

  /* ================= SUMMARY ================= */

  const gst = data.gst || {};

  draw("SUMMARY", 400, 11, true);

  down();

  const rows = [
    ["Taxable", gst.taxable],
    ["CGST", gst.cgst],
    ["SGST", gst.sgst],
    ["IGST", gst.igst],
    ["Grand Total", data.order?.billing?.grandTotal],
  ];

  rows.forEach(([k, v]) => {
    draw(k, 400, 9);
    draw(formatMoney(v, mode), 480, 9);
    down(12);
  });

  return await pdf.save();
}
