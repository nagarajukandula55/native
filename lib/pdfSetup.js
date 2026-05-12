// lib/pdfSetup.js

import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export function createPDF() {
  console.log("========== PDF SETUP ==========");
  console.log("CWD:", process.cwd());

  const regularPath = path.resolve(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldPath = path.resolve(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  console.log("Regular:", regularPath);
  console.log("Bold:", boldPath);

  if (!fs.existsSync(regularPath)) {
    throw new Error(`Inter-Regular.ttf missing at ${regularPath}`);
  }

  if (!fs.existsSync(boldPath)) {
    throw new Error(`Inter-Bold.ttf missing at ${boldPath}`);
  }

  const regularBuffer = fs.readFileSync(regularPath);
  const boldBuffer = fs.readFileSync(boldPath);

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    autoFirstPage: true,
    bufferPages: false,
    pdfVersion: "1.4",
    info: {
      Title: "Invoice",
      Author: "Native Store",
    },
  });

  doc.registerFont("Inter", regularBuffer);
  doc.registerFont("Inter-Bold", boldBuffer);

  // force bind immediately
  doc._font = null;
  doc.font("Inter");

  console.log("✅ Inter fonts loaded");

  return doc;
}
