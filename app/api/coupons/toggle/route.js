import { NextResponse } from "next/server";

import connectDB from "@/lib/db";

import Coupon from "@/models/Coupon";

export const runtime = "nodejs";

export async function PATCH(
  req: Request
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const {
      id,
      active,
      expiry,
    } = body;

    const updateData: any = {};

    if (
      typeof active ===
      "boolean"
    ) {
      updateData.active =
        active;
    }

    if (expiry) {
      updateData.expiry =
        new Date(expiry);
    }

    const updated =
      await Coupon.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        }
      );

    if (!updated) {
      throw new Error(
        "Coupon not found"
      );
    }

    return NextResponse.json({
      success: true,
      coupon: updated,
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Update failed",
      },
      {
        status: 500,
      }
    );
  }
}
