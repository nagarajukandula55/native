export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {

  try {

    await dbConnect();

    const orders =
      await Order.find({})
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({

      success: true,

      orders,
    });

  } catch (err) {

    console.log(
      "LIST ORDER ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message,
      },
      { status: 500 }
    );
  }
}
