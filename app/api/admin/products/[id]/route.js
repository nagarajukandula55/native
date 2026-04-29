import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing product id" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id).exec();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: product.toObject(),
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
