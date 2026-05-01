import { NextResponse } from "next/server";

/* ================= GST FORMAT ================= */
const GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/;

/* ================= STATE CODE MAP ================= */
const GST_STATE_MAP = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman & Diu",
  "26": "Dadra & Nagar Haveli",
  "27": "Maharashtra",
  "28": "Andhra Pradesh (Old)",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
};

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

    /* ================= EXTRACT STATE ================= */
    const stateCode = gstNumber.slice(0, 2);
    const state = GST_STATE_MAP[stateCode] || "Unknown";

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,

      data: {
        gstNumber,

        // 🚫 NOT VERIFIED (IMPORTANT)
        status: "FORMAT_VALID",

        // ❌ no fake company names
        legalName: "",
        tradeName: "",

        // ✅ real derived values
        state,
        stateCode,
      },

      message: "GST format is valid (not verified with government database)",
    });

  } catch (err) {
    console.error("GST VERIFY ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "GST validation failed",
    });
  }
}
