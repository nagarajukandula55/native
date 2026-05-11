// /lib/pdfSetup.js

import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export function createPDF() {

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
    autoFirstPage: true,

    // IMPORTANT
    font: null,
  });

  // FONT PATHS
  const regularFont = path.join(
    process.cwd(),
    "public/fonts/Inter_28pt-Regular.ttf"
  );

  const boldFont = path.join(
    process.cwd(),
    "public/fonts/Inter_28pt-Bold.ttf"
  );

  // REGISTER ONLY IF EXISTS
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

  // FORCE CUSTOM FONT
  doc.font("Inter");

  return doc;
}
