import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { generateSKU } from "@/lib/skuGenerator";

export async function GET() {
  try {
    await connectDB();

    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, products: [] },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!["admin", "super_admin", "vendor"].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, products: [] },
        { status: 403 }
      );
    }

    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, products: [] },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!["admin", "super_admin", "vendor"].includes(decoded.role)) {
      return NextResponse.json(
        { success: false },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      name,
      productKey,
      variantValue,
      variantUnit,
      slug,
    } = body;

    const variant = `${variantValue}${variantUnit}`.toUpperCase();

    /* 🔥 GENERATE SKU */
    const sku = await generateSKU(productKey, variant);

    /* 🔥 UNIQUE SLUG */
    const finalSlug = `${slug}-${variant.toLowerCase()}`;

    const product = await Product.create({
      ...body,
      sku,
      variant,
      slug: finalSlug,
    });

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (err) {
    console.error(err);

    /* HANDLE DUPLICATE VARIANT */
    if (err.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Variant already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
