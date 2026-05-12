// lib/pdfSetup.js

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export function createPDF() {
  const regularFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  if (!fs.existsSync(regularFont)) {
    throw new Error(`Missing font: ${regularFont}`);
  }

  if (!fs.existsSync(boldFont)) {
    throw new Error(`Missing font: ${boldFont}`);
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    autoFirstPage: false
  });

  doc.registerFont("Inter", regularFont);
  doc.registerFont("Inter-Bold", boldFont);

  doc.addPage();
  doc.font("Inter");

  return doc;
}
