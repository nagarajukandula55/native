// lib/pdfSetup.js

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

  console.log("📄 Regular:", regularFont);
  console.log("📄 Bold:", boldFont);

  console.log(
    "✅ Regular Exists:",
    fs.existsSync(regularFont)
  );

  console.log(
    "✅ Bold Exists:",
    fs.existsSync(boldFont)
  );

  if (!fs.existsSync(regularFont)) {
    throw new Error("Inter-Regular.ttf missing");
  }

  if (!fs.existsSync(boldFont)) {
    throw new Error("Inter-Bold.ttf missing");
  }

  /* CRITICAL FIX */
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    bufferPages: false,
    autoFirstPage: false,
    pdfVersion: "1.4",

    // Prevent PDFKit from loading Helvetica.afm
    font: regularFont,
  });

  doc.registerFont("Inter", regularFont);
  doc.registerFont("Inter-Bold", boldFont);

  doc.addPage();

  doc.font("Inter");

  console.log("✅ PDF READY");

  return doc;
}
