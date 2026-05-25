export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function PATCH(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      id,
      active,
      expiry,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon ID required",
        },
        {
          status: 400,
        }
      );
    }

    const updateData = {};

    /* =========================
       ACTIVE TOGGLE
    ========================= */

    if (
      typeof active === "boolean"
    ) {
      updateData.active = active;
    }

    /* =========================
       EXPIRY UPDATE
    ========================= */

    if (expiry) {
      updateData.expiry =
        new Date(expiry);
    }

    const coupon =
      await Coupon.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        {
          new: true,
        }
      );

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      coupon,
    });

  } catch (err) {
    console.error(
      "COUPON TOGGLE ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update coupon",
      },
      {
        status: 500,
      }
    );
  }
}
