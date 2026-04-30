import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      code,
      type, // flat | percent
      value,
      minCartValue,
      maxDiscount,
      usageLimit,
      expiry,
    } = body;

    if (!code || !type || !value) {
      return Response.json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existing = await Coupon.findOne({
      code: code.toUpperCase(),
    });

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
      expiry: expiry || null,
      active: true,
    });

    return Response.json({
      success: true,
      coupon,
    });
  } catch (err) {
    console.error("CREATE COUPON ERROR:", err);

    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}
