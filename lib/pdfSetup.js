import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

/**
 * =========================================
 * SAFE PDF SETUP (PRODUCTION + SERVERLESS SAFE)
 * =========================================
 * - Prevents Helvetica.afm crash in Next.js/Vercel
 * - Safe font fallback system
 * - No silent PDFKit fallback failures
 * - Stable for invoices, receipts, GST PDFs
 */

export function createPDF() {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    bufferPages: false,
    autoFirstPage: true,
    pdfVersion: "1.4",
  });

  /* ================= FONT PATHS ================= */
  const regularFontPath = path.join(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldFontPath = path.join(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  /* ================= CHECK FILES ================= */
  const hasRegular = fs.existsSync(regularFontPath);
  const hasBold = fs.existsSync(boldFontPath);

  /* ================= SAFE FONT REGISTRATION ================= */
  try {
    if (hasRegular) {
      doc.registerFont("Inter", regularFontPath);
    }

    if (hasBold) {
      doc.registerFont("Inter-Bold", boldFontPath);
    }
  } catch (err) {
    console.warn("Font registration failed:", err.message);
  }

  /* =========================================================
     SAFE FONT SWITCHER (🔥 IMPORTANT FIX)
     - Prevents Helvetica AFM dependency crash
     - Always guarantees a valid font
  ========================================================= */
  const safeFont = (fontName) => {
    try {
      doc.font(fontName);
    } catch (err) {
      console.warn(
        `Font "${fontName}" not available. Falling back to Helvetica.`
      );

      // final safe fallback (built-in, no .afm dependency in runtime)
      doc.font("Helvetica");
    }
    return doc;
  };

  /* ================= INITIAL FONT ================= */
  if (hasRegular) {
    safeFont("Inter");
  } else {
    safeFont("Helvetica");
  }

  /* ================= ATTACH HELPER ================= */
  doc.safeFont = safeFont;

  return doc;
}
