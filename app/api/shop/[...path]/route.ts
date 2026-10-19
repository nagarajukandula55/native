import { NextRequest, NextResponse } from "next/server";

// Keep shop sessions on Native. Forward only the shop cookie and supported
// operations; the backend retains responsibility for shop/order authorization.
async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  const allowed = (req.method === "POST" && ["login", "logout"].includes(path)) ||
    (req.method === "GET" && ["me", "orders"].includes(path)) ||
    (req.method === "PUT" && /^orders\/[a-f\d]{24}\/status$/i.test(path));
  if (!allowed) return NextResponse.json({ success: false }, { status: 404 });
  if (req.method !== "GET" && req.headers.get("origin") !== req.nextUrl.origin) {
    return NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 });
  }
  if (path === "logout") {
    const response = NextResponse.json({ success: true });
    response.cookies.set("shop_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  const base = process.env.AN_GROUP_API_URL || process.env.NEXT_PUBLIC_AN_API;
  if (!base) return NextResponse.json({ success: false, message: "Shop login is not configured." }, { status: 503 });
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = req.cookies.get("shop_token")?.value;
    if (token) headers.Cookie = `shop_token=${encodeURIComponent(token)}`;
    const upstream = await fetch(`${base.replace(/\/$/, "")}/api/shop/${path}`, {
      method: req.method,
      headers,
      body: req.method === "GET" ? undefined : JSON.stringify(await req.json()),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    const response = NextResponse.json(await upstream.json(), { status: upstream.status });
    response.headers.set("Cache-Control", "no-store");
    if (path === "login" && upstream.ok) {
      const cookie = upstream.headers.get("set-cookie")?.match(/(?:^|,\s*)shop_token=([^;]+)/)?.[1];
      if (!cookie) return NextResponse.json({ success: false, message: "Unable to start shop session." }, { status: 502 });
      response.cookies.set("shop_token", decodeURIComponent(cookie), {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60,
      });
    }
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Shop service is unavailable. Please try again." }, { status: 502 });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT };
