import { NextResponse } from "next/server";
import db from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";

export async function PUT(req) {
  await db();

  const body = await req.json();

  let settings = await PaymentSettings.findOne();

  if (!settings) {
    settings = await PaymentSettings.create(body);
  } else {
    settings = await PaymentSettings.findByIdAndUpdate(
      settings._id,
      body,
      { new: true }
    );
  }

  return NextResponse.json({
    success: true,
    settings,
  });
}
