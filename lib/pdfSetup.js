// lib/pdfSetup.js

import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export function createPDF() {
  console.log("========== PDF SETUP START ==========");

  const regularFontPath = path.resolve(
    "./public/fonts/Inter-Regular.ttf"
  );

  const boldFontPath = path.resolve(
    "./public/fonts/Inter-Bold.ttf"
  );

  console.log("Regular Font Path:", regularFontPath);
  console.log("Bold Font Path:", boldFontPath);

  console.log(
    "Regular Exists:",
    fs.existsSync(regularFontPath)
  );

  console.log(
    "Bold Exists:",
    fs.existsSync(boldFontPath)
  );

  if (!fs.existsSync(regularFontPath)) {
    console.error(
      "❌ Inter-Regular.ttf NOT FOUND"
    );

    throw new Error(
      `Missing font file: ${regularFontPath}`
    );
  }

  if (!fs.existsSync(boldFontPath)) {
    console.error(
      "❌ Inter-Bold.ttf NOT FOUND"
    );

    throw new Error(
      `Missing font file: ${boldFontPath}`
    );
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    compress: true,
    bufferPages: false,
    autoFirstPage: true,
    pdfVersion: "1.4",
  });

  console.log("✅ PDFDocument created");

  try {
    const regularBuffer = fs.readFileSync(
      regularFontPath
    );

    const boldBuffer = fs.readFileSync(
      boldFontPath
    );

    console.log(
      "Regular Font Size:",
      regularBuffer.length
    );

    console.log(
      "Bold Font Size:",
      boldBuffer.length
    );

    doc.registerFont(
      "Inter",
      regularBuffer
    );

    console.log(
      "✅ Registered Inter"
    );

    doc.registerFont(
      "Inter-Bold",
      boldBuffer
    );

    console.log(
      "✅ Registered Inter-Bold"
    );

    doc.font("Inter");

    console.log(
      "✅ Default font set to Inter"
    );
  } catch (err) {
    console.error(
      "❌ FONT REGISTRATION FAILED"
    );

    console.error(err);

    throw err;
  }

  console.log("========== PDF SETUP SUCCESS ==========");

  return doc;
}
