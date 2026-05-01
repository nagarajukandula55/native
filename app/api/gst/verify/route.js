import { NextResponse } from "next/server";

const GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/;

export async function POST(req) {
  try {
    const { gstNumber } = await req.json();

    /* ================= FORMAT VALIDATION ================= */
    if (!gstNumber || !GST_REGEX.test(gstNumber)) {
      return NextResponse.json({
        success: false,
        message: "Invalid GSTIN format",
      });
    }

    /* ================= CALL GST API ================= */
    const res = await fetch(
      `https://api.mastersindia.co/gstin/${gstNumber}`,
      {
        headers: {
          // ⚠️ try both if needed
          Authorization: process.env.GST_API_KEY,
          // Authorization: `Bearer ${process.env.GST_API_KEY}`,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    /* ================= STRICT VALIDATION ================= */
    if (
      !data ||
      data.error ||
      !data.lgnm // 🚨 MUST have legal name
    ) {
      return NextResponse.json({
        success: false,
        message: "Invalid GSTIN",
      });
    }

    /* ================= NORMALIZED RESPONSE ================= */
    const normalized = {
      gstNumber,

      legalName: data.lgnm || "",
      tradeName: data.tradeNam || "",

      state:
        data.pradr?.addr?.st ||
        "",

      stateCode:
        data.stjCd ||
        gstNumber.slice(0, 2),

      status: data.sts || "ACTIVE",
    };

    return NextResponse.json({
      success: true,
      data: normalized,
    });

  } catch (err) {
    console.error("GST VERIFY ERROR:", err);

    /* 🚨 NO FAKE SUCCESS ANYMORE */
    return NextResponse.json({
      success: false,
      message: "GST verification failed. Try again.",
    });
  }
}
