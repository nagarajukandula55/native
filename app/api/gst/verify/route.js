import { NextResponse } from "next/server";

const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/;

export async function POST(req) {
  try {
    const { gstNumber } = await req.json();

    if (!gstNumber || !gstRegex.test(gstNumber)) {
      return NextResponse.json({
        success: false,
        message: "Invalid GSTIN format",
      });
    }

    /* ================= MOCK / FALLBACK ================= */
    // Replace with real API later
    return NextResponse.json({
      success: true,
      data: {
        gstNumber,
        legalName: "Demo Business",
        stateCode: gstNumber.slice(0, 2),
        status: "ACTIVE",
      },
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "GST validation failed",
    });
  }
}
