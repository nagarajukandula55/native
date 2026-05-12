import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export function createPDF() {
  const regularFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  if (!fs.existsSync(regularFont) || !fs.existsSync(boldFont)) {
    throw new Error("Fonts missing in /public/fonts");
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    autoFirstPage: false,
    bufferPages: true,
  });

  doc.registerFont("REG", regularFont);
  doc.registerFont("BOLD", boldFont);

  doc.addPage();

  // 🔥 HARD SAFETY OVERRIDE (THIS IS THE FIX)
  doc.font = function (name) {
    if (!name || name.includes("Helvetica") || name.includes("Times")) {
      return PDFDocument.prototype.font.call(this, "REG");
    }
    return PDFDocument.prototype.font.call(this, name);
  };

  doc.useRegular = () => doc.font("REG");
  doc.useBold = () => doc.font("BOLD");

  return doc;
}
