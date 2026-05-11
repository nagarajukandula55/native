// /lib/pdfSetup.js

import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export function createPDF() {

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,

    // FIX
    bufferPages: false,

    autoFirstPage: true,

    // IMPORTANT
    font: null,

    // HUGE FIX
    compress: true,
  });

  const regularFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  if (fs.existsSync(regularFont)) {
    doc.registerFont(
      "Inter",
      regularFont
    );
  }

  if (fs.existsSync(boldFont)) {
    doc.registerFont(
      "Inter-Bold",
      boldFont
    );
  }

  doc.font("Inter");

  return doc;
}
