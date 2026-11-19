import { NextResponse } from "next/server";

/**
 * Same-origin public proxy for the banners managed in Native Admin.
 * It avoids a browser CORS dependency and keeps the homepage's server and
 * client renders on the exact same source of truth.
 */
export async function GET() {
  const base = process.env.NATIVE_ADMIN_API_URL || "https://admin.shopnative.in";

  try {
    const upstream = await fetch(`${base.replace(/\/$/, "")}/api/storefront/banners`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = await upstream.json();
    return NextResponse.json(data, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { success: false, banners: [], message: "Homepage banners are temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
