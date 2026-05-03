import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("📩 Contact Form:", body);

    // TODO: store in DB / send email / WhatsApp bot

    return NextResponse.json({
      success: true,
      message: "Message received",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
