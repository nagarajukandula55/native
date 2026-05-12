import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export function createPDF() {
  console.log("🚀 PDF INIT START");

  const regularFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  if (!fs.existsSync(regularFont)) {
    throw new Error("❌ Inter-Regular.ttf missing in /public/fonts");
  }

  if (!fs.existsSync(boldFont)) {
    throw new Error("❌ Inter-Bold.ttf missing in /public/fonts");
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    autoFirstPage: false,
    compress: true,
    bufferPages: true,
  });

  // REGISTER FONTS (ONLY SOURCE OF TRUTH)
  doc.registerFont("REG", regularFont);
  doc.registerFont("BOLD", boldFont);

  // SAFE FONT WRAPPERS (THIS FIXES ALL CRASHES)
  doc.useRegular = () => doc.font("REG");
  doc.useBold = () => doc.font("BOLD");

  // CREATE FIRST PAGE MANUALLY
  doc.addPage();

  console.log("✅ PDF READY (ERP SAFE MODE)");

  return doc;
}
