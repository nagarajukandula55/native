import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";

/* ================= TOGGLE + OPTIONAL EXPIRY UPDATE ================= */
export async function PATCH(req) {
  try {
    await dbConnect();

    const { id, active, expiry } = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Coupon ID required",
      });
    }

    const updateData = {};

    // toggle active
    if (typeof active === "boolean") {
      updateData.active = active;
    }

    // extend expiry
    if (expiry) {
      updateData.expiry = new Date(expiry);
    }

    const updated = await Coupon.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({
        success: false,
        message: "Coupon not found",
      });
    }

    return NextResponse.json({
      success: true,
      coupon: updated,
    });

  } catch (err) {
    console.error("TOGGLE ERROR:", err);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
