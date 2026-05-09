import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET() {

  try {

    await sendTelegramMessage(`
✅ TELEGRAM TEST SUCCESS
`);

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
