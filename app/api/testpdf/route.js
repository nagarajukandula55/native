export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createPDF } from "@/lib/pdfSetup";

export async function GET() {
  try {
    const pdf = createPDF();

    const chunks = [];
    pdf.on("data", c => chunks.push(c));

    pdf.font("Inter");
    pdf.fontSize(24).text("PDF FONT TEST OK", 100, 100);

    pdf.end();

    const buffer = await new Promise(resolve => {
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf"
      }
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message,
      stack: err.stack
    });
  }
}
