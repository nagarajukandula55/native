import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Pincode from "@/models/Pincode";

export async function GET(
  req,
  { params }
) {
  try {
    await connectDB();

    const code =
      String(params.code).trim();

    const result =
      await Pincode.findOne({
        Pincode: code,
      }).lean();

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Pincode not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      city:
        result.City ||
        result.DistrictsName,

      district:
        result.DistrictsName,

      state: result.State,

      postOffice:
        result.PostOfficeName,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
