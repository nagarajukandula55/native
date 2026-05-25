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
    await connectDB();

    const { code } =
      await context.params;

    /* ========================================
       GET CONNECTION + MODEL
    ======================================== */

    const conn =
      mongoose.connection;

    const Pincode =
      getPincodeModel(conn);

    /* ========================================
       CHECK DATABASE FIRST
    ======================================== */

    const existing =
      await Pincode.findOne({
        pincode: code,
      }).lean();

    if (existing) {
      return NextResponse.json({
        success: true,

        city: existing.city,

        state: existing.state,

        district:
          existing.district,

        postOffice:
          existing.officeName,

        deliveryStatus:
          existing.deliveryStatus,

        isServiceable:
          existing.isServiceable,

        isCODAvailable:
          existing.isCODAvailable,

        shippingZone:
          existing.shippingZone,

        estimatedDays:
          existing.estimatedDays,

        source: "database",
      });
    }

    /* ========================================
       FETCH FROM INDIA POST API
    ======================================== */

    const response = await fetch(
      `https://api.postalpincode.in/pincode/${code}`,
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json();

    const postOffice =
      data?.[0]?.PostOffice?.[0];

    if (!postOffice) {
      return NextResponse.json({
        success: false,
        error: "Pincode not found",
      });
    }

    /* ========================================
       SAVE TO DATABASE
    ======================================== */

    const created =
      await Pincode.create({
        pincode: code,

        officeName:
          postOffice.Name || "",

        district:
          postOffice.District ||
          "",

        city:
          postOffice.Block ||
          postOffice.District ||
          "",

        state:
          postOffice.State || "",

        country: "India",

        deliveryStatus:
          "Delivery",

        isServiceable: true,

        isCODAvailable: true,

        shippingZone: "A",

        estimatedDays: 3,

        updatedAt:
          new Date(),
      });

    /* ========================================
       RETURN RESPONSE
    ======================================== */

    return NextResponse.json({
      success: true,

      city: created.city,

      state: created.state,

      district:
        created.district,

      postOffice:
        created.officeName,

      deliveryStatus:
        created.deliveryStatus,

      isServiceable:
        created.isServiceable,

      isCODAvailable:
        created.isCODAvailable,

      shippingZone:
        created.shippingZone,

      estimatedDays:
        created.estimatedDays,

      source: "api",
    });
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
