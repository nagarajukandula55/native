import { NextRequest, NextResponse } from "next/server";

import Pincode from "@/models/Pincode";

import { connectNativeDB } from "@/lib/native-mongodb";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      code: string;
    }>;
  }
) {
  try {
    await connectNativeDB();

    const { code } =
      await context.params;

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: "Pincode missing",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      await Pincode.findOne({
        pincode: code,
      }).lean();

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: "Pincode not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (err: any) {
    console.error(
      "PINCODE LOOKUP FAILED:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        error:
          err.message ||
          "Pincode lookup failed",
      },
      {
        status: 500,
      }
    );
  }
}
