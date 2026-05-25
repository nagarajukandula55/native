export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      code,
      type,
      value,
      minCartValue,
      maxDiscount,
      usageLimit,
      expiry,
    } = body;

    /* =========================
       VALIDATION
    ========================= */

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code required",
        },
        {
          status: 400,
        }
      );
    }

    if (!value || Number(value) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon value",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       CHECK EXISTING
    ========================= */

    const existing =
      await Coupon.findOne({
        code: code.toUpperCase(),
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Coupon already exists",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       CREATE COUPON
    ========================= */

    const coupon =
      await Coupon.create({
        code: code.toUpperCase(),

        type:
          type === "percent"
            ? "percent"
            : "flat",

        value: Number(value),

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

        usedBy: [],
      });

    return NextResponse.json({
      success: true,
      coupon,
    });

  } catch (err) {
    console.error(
      "CREATE COUPON ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create coupon",
      },
      {
        status: 500,
      }
    );
  }
}
