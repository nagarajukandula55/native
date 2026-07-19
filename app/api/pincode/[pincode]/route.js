/**
 * GET /api/pincode/[pincode] — was called by checkout's pincode-lookup
 * effect but never existed anywhere in this app (no app/api directory at
 * all before this file), so it always 404'd, silently caught by the
 * calling effect's try/catch. City/State never auto-filled.
 *
 * Proxies India Post's public pincode API server-side (avoids exposing/
 * depending on client-side CORS behavior of a third-party API, and keeps
 * the response shape stable for the frontend regardless of upstream
 * changes).
 */
export async function GET(req, { params }) {
  const pincode = params?.pincode;

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return Response.json({ success: false, message: "Invalid pincode" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      cache: "no-store",
    });
    const data = await res.json();
    const result = Array.isArray(data) ? data[0] : null;
    const office = result?.PostOffice?.[0];

    if (result?.Status !== "Success" || !office) {
      return Response.json({ success: false, message: "Pincode not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      city: office.District || office.Block || office.Name || "",
      state: office.State || "",
    });
  } catch (err) {
    return Response.json({ success: false, message: "Pincode lookup failed" }, { status: 502 });
  }
}
