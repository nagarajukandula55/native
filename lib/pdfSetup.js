import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

/**
 * SAFE PDF KIT INITIALIZER (Serverless + Next.js safe)
 * - Prevents Helvetica AFM crash
 * - Guarantees fallback font
 * - Handles missing font files gracefully
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

  // ================= FONT PATHS =================
  const regularFontPath = path.join(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldFontPath = path.join(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  // ================= SAFETY FLAGS =================
  const hasRegularFont = fs.existsSync(regularFontPath);
  const hasBoldFont = fs.existsSync(boldFontPath);

  // ================= REGISTER FONTS SAFELY =================
  try {
    if (hasRegularFont) {
      doc.registerFont("Inter", regularFontPath);
    }

    if (hasBoldFont) {
      doc.registerFont("Inter-Bold", boldFontPath);
    }
  } catch (err) {
    console.warn("⚠️ Font registration failed, falling back to Helvetica:", err.message);
  }

  /**
   * ================= SAFE FONT WRAPPER =================
   * Prevents undefined font crashes
   */
  const safeFont = (fontName) => {
    try {
      doc.font(fontName);
    } catch (err) {
      console.warn(`⚠️ Font "${fontName}" not found. Falling back to Helvetica.`);
      doc.font("Helvetica");
    }
    return doc;
  };

  // ================= FORCE INITIAL SAFE FONT =================
  safeFont(hasRegularFont ? "Inter" : "Helvetica");

  // ================= PATCH DOC FOR SAFETY =================
  doc.safeFont = safeFont;

  return doc;
}
