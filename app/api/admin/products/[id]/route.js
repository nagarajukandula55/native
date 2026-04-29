import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

/* ================= GET SINGLE PRODUCT ================= */
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

/* ================= UPDATE ACTIONS ================= */
export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const id = params?.id;
    const body = await req.json();

    const { action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "Missing id or action" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= ACTION ENGINE ================= */
    switch (action) {

      case "approve":
        product.status = "approved";
        product.isActive = true;
        break;

      case "reject":
        product.status = "rejected";
        product.isActive = false;
        product.isListed = false;
        break;

      case "list":
        if (product.status !== "approved") {
          return NextResponse.json(
            { success: false, message: "Only approved products can be listed" },
            { status: 400 }
          );
        }
        product.isListed = true;
        break;

      case "delist":
        product.isListed = false;
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: `Action ${action} completed`,
      product: product.toObject(),
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
