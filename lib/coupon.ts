import Coupon from "@/models/Coupon";
import { connectNativeDB } from "@/lib/native-mongodb";

type ValidateCouponResult = {
  valid: boolean;
  discount: number;
  coupon?: any;
  message?: string;
};

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<ValidateCouponResult> {

  try {

    if (!code) {
      return {
        valid: false,
        discount: 0,
        message: "Coupon missing",
      };
    }

    // CONNECT NATIVE DB
    await connectNativeDB();

    // FIND COUPON
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      active: true,
    });

    if (!coupon) {
      return {
        valid: false,
        discount: 0,
        message: "Invalid coupon",
      };
    }

    // EXPIRY CHECK
    if (
      coupon.expiry &&
      new Date(coupon.expiry) < new Date()
    ) {
      return {
        valid: false,
        discount: 0,
        message: "Coupon expired",
      };
    }

    // MIN CART CHECK
    if (subtotal < coupon.minCartValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum cart value ₹${coupon.minCartValue}`,
      };
    }

    // USAGE LIMIT
    if (
      coupon.usageLimit > 0 &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return {
        valid: false,
        discount: 0,
        message: "Coupon usage exceeded",
      };
    }

    let discount = 0;

    // FLAT DISCOUNT
    if (coupon.type === "flat") {

      discount = coupon.value;

    }

    // PERCENT DISCOUNT
    else if (coupon.type === "percent") {

      discount =
        subtotal * (coupon.value / 100);

      // MAX DISCOUNT LIMIT
      if (
        coupon.maxDiscount > 0 &&
        discount > coupon.maxDiscount
      ) {
        discount = coupon.maxDiscount;
      }
    }

    // NEVER EXCEED SUBTOTAL
    discount = Math.min(
      subtotal,
      discount
    );

    return {
      valid: true,
      discount: Number(discount.toFixed(2)),
      coupon,
    };

  } catch (err) {

    console.error(
      "COUPON VALIDATION ERROR:",
      err
    );

    return {
      valid: false,
      discount: 0,
      message: "Coupon validation failed",
    };
  }
}
