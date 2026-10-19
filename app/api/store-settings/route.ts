import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.NATIVE_ADMIN_API_URL || "https://admin.shopnative.in";
  try {
    const upstream = await fetch(`${base.replace(/\/$/, "")}/api/store-settings`, {
      cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json(await upstream.json(), { status: upstream.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, message: "Checkout settings are temporarily unavailable." }, { status: 503 });
  }
}
