import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { resolve, safe, money } from "./resolver";

export async function renderPDF(layout, data) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;

  const text = (t, x, size = 10, isBold = false) => {
    page.drawText(safe(t), {
      x,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0, 0, 0),
    });
  };

  const down = (h = 14) => (y -= h);

  /* ================= HEADER ================= */

  const header = layout.header;

  if (header?.showCompany) {
    text(resolve("company.companyName", data), 40, 16, true);
    down();

    text(
      header.showTagline
        ? data.company?.tagline || header.defaultTagline
        : "",
      40,
      10
    );
    down(20);
  }

  /* ================= INVOICE BOX ================= */

  const box = layout.invoiceBox;

  if (box) {
    text(box.title, 420, 12, true);
    down();

    box.fields.forEach((f) => {
      text(`${f.label}: ${resolve(f.key, data)}`, 420, 9);
      down(12);
    });

    down(20);
  }

  /* ================= PARTIES ================= */

  const addr = data.order?.address || {};

  if (layout.parties?.billTo) {
    text("BILL TO", 40, 11, true);
    down();

    text(addr.name, 40);
    text(addr.phone, 40);
    text(addr.address, 40);
    down(30);
  }

  if (layout.parties?.shipTo) {
    text("SHIP TO", 200, 11, true);
    down();

    text(addr.city, 200);
    text(addr.state, 200);
    down(30);
  }

  /* ================= ITEMS ================= */

  const items = Array.isArray(data.order?.items)
    ? data.order.items
    : [];

  text("ITEMS", 40, 11, true);
  down();

  let total = 0;

  items.forEach((it, i) => {
    const rowTotal = Number(it?.total || 0);
    total += rowTotal;

    text(
      `${i + 1}. ${it?.name || "-"} | Qty:${it?.qty || 0} | ₹${money(
        rowTotal
      )}`,
      40,
      9
    );

    down(12);
  });

  down(10);
  text(`ITEM TOTAL: ₹${money(total)}`, 40, 11, true);

  down(30);

  /* ================= SUMMARY ================= */

  const gst = data.gst || {};

  const summary = layout.summary;

  if (summary?.enabled) {
    text("SUMMARY", 400, 11, true);

    down();

    summary.fields.forEach((k) => {
      text(
        `${k.toUpperCase()}: ${money(gst[k] || data.order?.billing?.[k])}`,
        400,
        9
      );
      down(12);
    });

    down(20);
  }

  /* ================= QR ================= */

  if (layout.qr?.enabled && data.qr) {
    const qrImg = await pdf.embedPng(data.qr);

    page.drawImage(qrImg, {
      x: 40,
      y: 120,
      width: 70,
      height: 70,
    });
  }

  /* ================= SIGNATURE ================= */

  if (layout.signature?.enabled && data.sign) {
    const signImg = await pdf.embedPng(data.sign);

    page.drawImage(signImg, {
      x: 150,
      y: 120,
      width: 90,
      height: 40,
    });

    text(layout.signature.label, 150, 9, true);
  }

  /* ================= FOOTER ================= */

  if (layout.footer?.enabled) {
    text(layout.footer.text, 40, 30, 8);
  }

  return await pdf.save();
}
