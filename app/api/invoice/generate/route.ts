import { NextResponse } from "next/server";

// The backend generates invoices through verified payment/admin workflows.
export async function POST() {
  return NextResponse.json({ success: false, message: "Invoices are generated automatically after payment." }, { status: 403 });
}
