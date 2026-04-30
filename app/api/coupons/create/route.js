import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  await dbConnect();

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

  const existing = await Coupon.findOne({ code });

  if (existing) {
    return Response.json({
      success: false,
      message: "Coupon already exists",
    });
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    type,
    value,
    minCartValue: minCartValue || 0,
    maxDiscount: maxDiscount || null,
    usageLimit: usageLimit || 0,
    usedBy: [],
    expiry,
    active: true,
  });

  return Response.json({
    success: true,
    coupon,
  });
}
