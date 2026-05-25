export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function GET() {
  try {
    await connectDB();

    const coupons =
      await Coupon.find({})
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      coupons,
    });

  } catch (err) {
    console.error(
      "FETCH COUPONS ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch coupons",
      },
      {
        status: 500,
      }
    );
  }
}
