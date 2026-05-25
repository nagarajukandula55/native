import { NextResponse } from "next/server";

import connectDB from "@/lib/db";

import Coupon from "@/models/Coupon";

export const runtime = "nodejs";

export async function POST(
  req: Request
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const code =
      body.code?.toUpperCase();

    const coupon =
      await Coupon.findOne({
        code,
        active: true,
      });

    if (!coupon) {
      throw new Error(
        "Invalid coupon"
      );
    }

    if (
      coupon.expiry &&
      new Date(coupon.expiry) <
        new Date()
    ) {
      throw new Error(
        "Coupon expired"
      );
    }

    if (
      coupon.usageLimit > 0 &&
      coupon.usedCount >=
        coupon.usageLimit
    ) {
      throw new Error(
        "Coupon usage limit reached"
      );
    }

    return NextResponse.json({
      success: true,
      discount:
        coupon.value,
      coupon,
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Coupon invalid",
      },
      {
        status: 400,
      }
    );
  }
}
