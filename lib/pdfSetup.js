import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export function createPDF() {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    bufferPages: false,
    autoFirstPage: true,
    pdfVersion: "1.4",
  });

  const regularFontPath = path.join(
    process.cwd(),
    "public/fonts/Inter-Regular.ttf"
  );

  const boldFontPath = path.join(
    process.cwd(),
    "public/fonts/Inter-Bold.ttf"
  );

  // HARD FAIL if fonts missing
  if (!fs.existsSync(regularFontPath)) {
    throw new Error(
      `Missing font: ${regularFontPath}`
    );
  }

  if (!fs.existsSync(boldFontPath)) {
    throw new Error(
      `Missing font: ${boldFontPath}`
    );
  }

  // Register only custom fonts
  doc.registerFont("Inter", regularFontPath);
  doc.registerFont("Inter-Bold", boldFontPath);

  // Never fallback to Helvetica
  doc.safeFont = (fontName = "Inter") => {
    if (fontName === "Inter-Bold") {
      doc.font("Inter-Bold");
    } else {
      doc.font("Inter");
    }
    return doc;
  };

  doc.safeFont("Inter");

  return doc;
}
