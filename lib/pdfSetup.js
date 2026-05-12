// lib/pdfSetup.js

import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export function createPDF() {
  console.log("========== PDF INIT ==========");
  console.log("cwd:", process.cwd());

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    bufferPages: false,
    autoFirstPage: true,
    pdfVersion: "1.4",
  });

  const regularFont = path.resolve(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldFont = path.resolve(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  console.log("Regular font:", regularFont);
  console.log("Bold font:", boldFont);

  console.log("Regular exists:", fs.existsSync(regularFont));
  console.log("Bold exists:", fs.existsSync(boldFont));

  try {
    if (!fs.existsSync(regularFont)) {
      throw new Error(`Missing font: ${regularFont}`);
    }

    if (!fs.existsSync(boldFont)) {
      throw new Error(`Missing font: ${boldFont}`);
    }

    doc.registerFont("Inter", regularFont);
    doc.registerFont("Inter-Bold", boldFont);

    console.log("✅ Fonts registered");

    doc.font("Inter");

    return doc;
  } catch (err) {
    console.error("❌ FONT REGISTRATION FAILED");
    console.error(err);

    throw new Error(
      `PDF font registration failed: ${err.message}`
    );
  }
}
