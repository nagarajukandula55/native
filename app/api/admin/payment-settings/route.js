import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

/* ================= SCHEMA ================= */

const SettingsSchema = new mongoose.Schema(
  {
    razorpay: {
      type: Boolean,
      default: true,
    },

    cod: {
      type: Boolean,
      default: true,
    },

    upi: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= MODEL ================= */

const Settings =
  mongoose.models.PaymentSettings ||
  mongoose.model(
    "PaymentSettings",
    SettingsSchema
  );

/* ================= GET ================= */

export async function GET() {

  try {

    await dbConnect();

    let settings =
      await Settings.findOne();

    if (!settings) {

      settings =
        await Settings.create({
          razorpay: true,
          cod: true,
          upi: true,
        });
    }

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (err) {

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}

/* ================= POST ================= */

export async function POST(req) {

  try {

    await dbConnect();

    const body = await req.json();

    let settings =
      await Settings.findOne();

    if (!settings) {

      settings =
        await Settings.create(body);

    } else {

      settings.razorpay =
        body.razorpay;

      settings.cod =
        body.cod;

      settings.upi =
        body.upi;

      await settings.save();
    }

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (err) {

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
