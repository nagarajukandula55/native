import fs from "fs";
import path from "path";
import { StandardFonts } from "pdf-lib";

/**
 * ERP FONT ENGINE V1
 * - prevents WinAnsi crashes
 * - supports ₹ and Unicode
 * - fallback safe
 */

export async function loadFonts(pdf) {
  const fontPath = path.join(
    process.cwd(),
    "public/fonts/NotoSans-Regular.ttf"
  );

  const boldPath = path.join(
    process.cwd(),
    "public/fonts/NotoSans-Bold.ttf"
  );

  const fallbackMode = !fs.existsSync(fontPath);

  if (fallbackMode) {
    // SAFE FALLBACK (no crashes, but no ₹)
    return {
      regular: await pdf.embedFont(StandardFonts.Helvetica),
      bold: await pdf.embedFont(StandardFonts.HelveticaBold),
      mode: "FALLBACK"
    };
  }

  const regularBytes = fs.readFileSync(fontPath);
  const boldBytes = fs.readFileSync(boldPath);

  return {
    regular: await pdf.embedFont(regularBytes, { subset: true }),
    bold: await pdf.embedFont(boldBytes, { subset: true }),
    mode: "UNICODE_SAFE"
  };
}
