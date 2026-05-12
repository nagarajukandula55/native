export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createPDF } from "@/lib/pdfSetup";

export async function GET() {
  try {
    console.log("TEST PDF ROUTE HIT");

    const pdf = createPDF();

    const chunks = [];
    pdf.on("data", (c) => chunks.push(c));

    pdf.font("Inter");
    pdf.fontSize(20).text("PDF FONT TEST SUCCESS", 100, 100);

    pdf.end();

    const buffer = await new Promise((resolve) => {
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (err) {
    console.error("TEST PDF ERROR:", err);

    return NextResponse.json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }
}
