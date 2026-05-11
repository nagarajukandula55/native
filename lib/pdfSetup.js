// /lib/pdfSetup.js

import PDFDocument from "pdfkit";
import path from "path";

export function createPDF() {

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
    autoFirstPage: true,
  });

  // REGISTER FONTS
  doc.registerFont(
    "Inter",
    path.join(
      process.cwd(),
      "public/fonts/Inter_28pt-Regular.ttf"
    )
  );

  doc.registerFont(
    "Inter-Bold",
    path.join(
      process.cwd(),
      "public/fonts/Inter_28pt-Bold.ttf"
    )
  );

  // DEFAULT FONT
  doc.font("Inter");

  return doc;
}
