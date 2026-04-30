import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("🔥 HIT API");

    const text = await req.text();
    console.log("📦 RAW BODY:", text);

    return NextResponse.json({
      success: true,
      message: "API is working",
      received: text,
    });

  } catch (err) {
    console.error("🔥 FATAL ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
