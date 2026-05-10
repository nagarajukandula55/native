// /lib/pdfSetup.js

import PDFDocument from "pdfkit";

export function createPDF() {

  return new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
    autoFirstPage: true,
  });
}
