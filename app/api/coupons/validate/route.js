export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const { code, subtotal = 0 } = body;

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

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon",
        },
        {
          status: 404,
        }
      );
    }

    /* =========================
       EXPIRY CHECK
    ========================= */

    if (
      coupon.expiry &&
      new Date(coupon.expiry) < new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon expired",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       MIN CART CHECK
    ========================= */

    if (
      Number(subtotal) <
      Number(coupon.minCartValue || 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum cart value ₹${coupon.minCartValue} required`,
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       USAGE LIMIT
    ========================= */

    if (
      Number(coupon.usageLimit || 0) > 0 &&
      Number(coupon.usedCount || 0) >=
        Number(coupon.usageLimit)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Coupon usage limit reached",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       CALCULATE DISCOUNT
    ========================= */

    let discount = 0;

    if (coupon.type === "percent") {
      discount =
        (Number(subtotal) *
          Number(coupon.value)) /
        100;

      if (
        coupon.maxDiscount &&
        discount >
          Number(coupon.maxDiscount)
      ) {
        discount = Number(
          coupon.maxDiscount
        );
      }
    } else {
      discount = Number(coupon.value);
    }

    discount = Math.min(
      Number(subtotal),
      Number(discount)
    );
    
    return NextResponse.json({
      success: true,
      valid: true,
      coupon,
    
      discount: Math.max(
        0,
        Number(discount.toFixed(2))
      ),
    });
  } catch (err) {
    console.error(
      "COUPON VALIDATE ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
      },
      {
        status: 500,
      }
    );
  }
}
