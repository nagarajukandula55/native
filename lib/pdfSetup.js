// lib/pdfSetup.js

import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
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

  console.log("Regular exists:", fs.existsSync(regularFont));
  console.log("Bold exists:", fs.existsSync(boldFont));

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

  doc.addPage();

  doc.registerFont("Inter", fs.readFileSync(regularFont));
  doc.registerFont("Inter-Bold", fs.readFileSync(boldFont));

  doc.font("Inter");

  console.log("✅ PDF initialized");

  return doc;
}
