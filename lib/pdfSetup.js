// lib/pdfSetup.js

import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export function createPDF() {
  console.log("========== PDF INIT ==========");

  const regularFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldFont = path.join(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  console.log("Regular font path:", regularFont);
  console.log("Bold font path:", boldFont);

  console.log("Regular exists:", fs.existsSync(regularFont));
  console.log("Bold exists:", fs.existsSync(boldFont));

  if (!fs.existsSync(regularFont)) {
    throw new Error(
      `Missing font file: ${regularFont}`
    );
  }

  if (!fs.existsSync(boldFont)) {
    throw new Error(
      `Missing font file: ${boldFont}`
    );
  }

  // IMPORTANT:
  // Do NOT allow pdfkit to auto-init Helvetica
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    bufferPages: false,
    autoFirstPage: false
  });

  doc.addPage();

  doc.registerFont("Inter", regularFont);
  doc.registerFont("Inter-Bold", boldFont);

  doc.font("Inter");

  console.log("✅ Inter font loaded");

  return doc;
}
