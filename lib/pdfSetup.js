// lib/pdfSetup.js

import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import fs from "fs";
import path from "path";

export function createPDF() {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    autoFirstPage: false,
  });

  doc.addPage();

  const regularPath = path.join(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldPath = path.join(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  if (!fs.existsSync(regularPath)) {
    throw new Error(`Missing font: ${regularPath}`);
  }

  if (!fs.existsSync(boldPath)) {
    throw new Error(`Missing font: ${boldPath}`);
  }

  // IMPORTANT:
  // pass path strings, not readFileSync buffers
  doc.registerFont("Inter", regularPath);
  doc.registerFont("Inter-Bold", boldPath);

  doc.font("Inter");

  return doc;
}
