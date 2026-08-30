import { NextResponse } from "next/server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const apiBase = process.env.NEXT_PUBLIC_AN_API;
  const serviceKey = process.env.ADMIN_SERVICE_KEY;

  if (!apiBase || !serviceKey) {
    return NextResponse.json(
      { success: false, message: "Admin native-products proxy is not configured" },
      { status: 500 }
    );
  }

  const { id } = await context.params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${apiBase}/api/admin/native-products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Could not reach ANgroup" }, { status: 502 });
  }
}
