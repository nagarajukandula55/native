import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export function createPDF() {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  const regular = fs.readFileSync(
    path.join(process.cwd(), "public/fonts/Inter-Regular.ttf")
  );

  const bold = fs.readFileSync(
    path.join(process.cwd(), "public/fonts/Inter-Bold.ttf")
  );

  doc.registerFont("Inter", regular);
  doc.registerFont("Inter-Bold", bold);

  doc.font("Inter");

  return doc;
}
