import { NextResponse } from "next/server";

import connectDB from "@/lib/db";

import Coupon from "@/models/Coupon";

export const runtime = "nodejs";

export async function DELETE(
  req: Request
) {
  try {
    await connectDB();

    const body =
      await req.json();

    const { id } = body;

    await Coupon.findByIdAndDelete(
      id
    );

    return NextResponse.json({
      success: true,
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}
