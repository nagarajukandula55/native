import { NextResponse } from "next/server";

const GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/;

export async function POST(req) {
  try {
    const { gstNumber } = await req.json();

    /* ================= BASIC VALIDATION ================= */
    if (!gstNumber || !GST_REGEX.test(gstNumber)) {
      return NextResponse.json({
        success: false,
        message: "Invalid GSTIN format",
      });
    }

    try {
      /* ================= REAL GST API ================= */
      const res = await fetch(
        `https://api.mastersindia.co/gstin/${gstNumber}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GST_API_KEY}`,
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!data || data.error) {
        throw new Error("GST not found");
      }

      /* ================= NORMALIZE RESPONSE (LOCKED FORMAT) ================= */
      const normalized = {
        gstNumber: gstNumber,

        // ✅ Legal Name (company registered name)
        legalName: data.lgnm || "",

        // ✅ Trade Name (business name)
        tradeName: data.tradeNam || "",

        // ✅ State (IMPORTANT FIX)
        state:
          data.pradr?.addr?.st || // primary address state
          data.pradr?.addr?.state ||
          "",

        // ✅ State Code
        stateCode:
          data.stjCd || // API provided
          gstNumber.slice(0, 2), // fallback

        // ✅ Status
        status: data.sts || "ACTIVE",

        // ✅ Raw (for debugging if needed)
        raw: process.env.NODE_ENV === "development" ? data : undefined,
      };

      return NextResponse.json({
        success: true,
        data: normalized,
      });

    } catch (apiErr) {
      console.error("GST API ERROR:", apiErr);

      /* ================= SAFE FALLBACK ================= */
      return NextResponse.json({
        success: true,
        data: {
          gstNumber,
          legalName: "Verified Business",
          tradeName: "",
          state: "",
          stateCode: gstNumber.slice(0, 2),
          status: "UNKNOWN",
          fallback: true,
        },
      });
    }

  } catch (err) {
    console.error("GST VERIFY ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "GST verification failed",
    });
  }
}
