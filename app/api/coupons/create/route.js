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

    const {
      code,
      type,
      value,
      minCartValue,
      maxDiscount,
      usageLimit,
      expiry,
    } = body;

    if (!code) {
      throw new Error(
        "Coupon code required"
      );
    }

    const existing =
      await Coupon.findOne({
        code:
          code.toUpperCase(),
      });

    if (existing) {
      throw new Error(
        "Coupon already exists"
      );
    }

    const coupon =
      await Coupon.create({
        code:
          code.toUpperCase(),

        type,

        value: Number(
          value || 0
        ),

        minCartValue: Number(
          minCartValue || 0
        ),

        maxDiscount: Number(
          maxDiscount || 0
        ),

        usageLimit: Number(
          usageLimit || 0
        ),

        expiry: expiry
          ? new Date(expiry)
          : null,

        active: true,
      });

    return NextResponse.json({
      success: true,
      coupon,
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Coupon creation failed",
      },
      {
        status: 500,
      }
    );
  }
}
