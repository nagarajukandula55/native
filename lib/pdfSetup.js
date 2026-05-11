// /lib/pdfSetup.js

import PDFDocument from "pdfkit";

export function createPDF() {

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,

    bufferPages: true,
    autoFirstPage: true,

    compress: true,

    pdfVersion: "1.4",
  });

  return doc;
}
