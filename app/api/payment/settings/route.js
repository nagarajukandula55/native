import { NextResponse } from "next/server";
import db from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";

export async function GET() {
  await db();

  let settings = await PaymentSettings.findOne();

  // create default if not exists
  if (!settings) {
    settings = await PaymentSettings.create({});
  }

  return NextResponse.json({
    success: true,
    settings,
  });
}
