import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  connectNativeDB,
} from "@/lib/native-mongodb";

import {
  getPincodeModel,
} from "@/models/Pincode";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      code: string;
    }>;
  }
) {
  try {

    const conn =
      await connectNativeDB();

    const Pincode =
      getPincodeModel(conn);

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
      data,
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
