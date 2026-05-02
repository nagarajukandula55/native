import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";

/* ================= GET ALL COUPONS ================= */
export async function GET() {
  try {
    await dbConnect();

    const coupons = await Coupon.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      coupons,
    });

  } catch (err) {
    console.error("FETCH COUPONS ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
}
