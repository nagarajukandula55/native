export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";

export async function GET() {
  await db();

  let settings = await PaymentSettings.findOne();

  if (!settings) {
    settings = await PaymentSettings.create({});
  }

  return NextResponse.json({ success: true, settings });
}

export async function PUT(req) {
  try {
    await db();

    const body = await req.json();

    let settings = await PaymentSettings.findOne();

    if (!settings) {
      settings = await PaymentSettings.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }

    return NextResponse.json({ success: true, settings });

  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
