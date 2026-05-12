// lib/pdfSetup.js

import PDFDocument from "pdfkit-next";
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

  console.log("Regular:", regularFont);
  console.log("Bold:", boldFont);

  if (!fs.existsSync(regularFont)) {
    throw new Error(`Missing Inter-Regular.ttf`);
  }

  if (!fs.existsSync(boldFont)) {
    throw new Error(`Missing Inter-Bold.ttf`);
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    autoFirstPage: false
  });

  doc.addPage();

  doc.registerFont("Inter", regularFont);
  doc.registerFont("Inter-Bold", boldFont);

  doc.font("Inter");

  console.log("✅ Fonts loaded");

  return doc;
}
