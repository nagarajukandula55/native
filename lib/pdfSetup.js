import PDFDocument from "pdfkit";

export function createPDF() {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
    font: undefined,
  });

  // Force built-in safe font (IMPORTANT FIX)
  doc.font("Helvetica");

  return doc;
}
