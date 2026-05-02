import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  try {
    await dbConnect();

    const { code, cartTotal, userId = "guest" } = await req.json();

    if (!code) {
      return NextResponse.json({
        success: false,
        message: "Coupon code required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!coupon) {
      return NextResponse.json({
        success: false,
        message: "Invalid Coupon",
      });
    }

    if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
      return NextResponse.json({
        success: false,
        message: "Coupon Expired",
      });
    }

    if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
      return NextResponse.json({
        success: false,
        message: `Minimum order ₹${coupon.minCartValue} required`,
      });
    }

    if (
      coupon.usageLimit === 1 &&
      coupon.usedBy?.includes(userId)
    ) {
      return NextResponse.json({
        success: false,
        message: "Already used",
      });
    }

    let discount = 0;

    if (coupon.type === "percent") {
      discount = (cartTotal * coupon.value) / 100;

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    return NextResponse.json({
      success: true,
      discount,
      couponId: coupon._id,
    });

  } catch (err) {
    console.error("VALIDATE COUPON ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
