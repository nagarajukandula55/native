export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

import { getPincodeModel } from "@/models/Pincode";

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      code: string;
    }>;
  }
) {
  try {
    /* ========================================
       CONNECT DB
    ======================================== */

    await connectDB();

    console.log(
      "CONNECTED DB:",
      mongoose.connection.db?.databaseName
    );

    /* ========================================
       GET PARAMS
    ======================================== */

    const { code } =
      await context.params;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pincode",
        },
        {
          status: 400,
        }
      );
    }

    /* ========================================
       GET MODEL
    ======================================== */

    const conn =
      mongoose.connection;

    const Pincode =
      getPincodeModel(conn);

    /* ========================================
       FIND FROM DATABASE
    ======================================== */

    const existing: any =
      await Pincode.findOne({
        pincode: String(code),
      }).lean();

    /* ========================================
       RETURN DB DATA
    ======================================== */

    if (existing) {
      console.log(
        "PINCODE FOUND IN DB:",
        code
      );

      return NextResponse.json({
        success: true,

        city:
          existing.city || "",

        state:
          existing.state || "",

        district:
          existing.district || "",

        postOffice:
          existing.officeName || "",

        deliveryStatus:
          existing.deliveryStatus ||
          "Delivery",

        isServiceable:
          existing.isServiceable ??
          true,

        isCODAvailable:
          existing.isCODAvailable ??
          true,

        shippingZone:
          existing.shippingZone ||
          "A",

        estimatedDays:
          existing.estimatedDays ||
          3,

        source: "database",
      });
    }

    /* ========================================
       NOT FOUND
    ======================================== */

    console.log(
      "PINCODE NOT FOUND:",
      code
    );

    return NextResponse.json(
      {
        success: false,
        error: "Pincode not found",
      },
      {
        status: 404,
      }
    );
  } catch (err: any) {
    console.error(
      "PINCODE API ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        error:
          err.message ||
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
