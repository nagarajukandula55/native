// lib/pdfSetup.js

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export function createPDF() {
  console.log("=== PDF SETUP START ===");

  const regularPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "Inter-Regular.ttf"
  );

  const boldPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "Inter-Bold.ttf"
  );

  console.log("Regular:", regularPath);
  console.log("Bold:", boldPath);

  if (!fs.existsSync(regularPath)) {
    throw new Error(`Missing font: ${regularPath}`);
  }

  if (!fs.existsSync(boldPath)) {
    throw new Error(`Missing font: ${boldPath}`);
  }

  const regularBuffer = fs.readFileSync(regularPath);
  const boldBuffer = fs.readFileSync(boldPath);

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    autoFirstPage: false // IMPORTANT
  });

  // Register BEFORE first page exists
  doc.registerFont("Inter", regularBuffer);
  doc.registerFont("Inter-Bold", boldBuffer);

  // Set font BEFORE page creation
  doc.font("Inter");

  // Create first page manually
  doc.addPage();

  console.log("=== PDF SETUP COMPLETE ===");

  return doc;
}
