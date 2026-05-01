import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CompanySettings from "@/models/CompanySettings";

/* ================= GET COMPANY ================= */
export async function GET() {
  try {
    await dbConnect();

    let company = await CompanySettings.findOne();

    /* AUTO-SEED if not exists */
    if (!company) {
      company = await CompanySettings.create({
        companyName: "Native Store",
        legalName: "Native Foods Pvt Ltd",
        invoicePrefix: "NA",
        receiptPrefix: "NARCP",
      });
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE COMPANY ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    let company = await CompanySettings.findOne();

    if (!company) {
      company = await CompanySettings.create(body);
    } else {
      company = await CompanySettings.findByIdAndUpdate(
        company._id,
        body,
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Failed to update company" },
      { status: 500 }
    );
  }
}
