"use client";

import { useEffect } from "react";
import { viewProduct } from "@/lib/gtag";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const product = await Product.findOne({ slug: params.slug });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Missing slug" },
        { status: 400 }
      );
    }

    /* ✅ FIND PRODUCT */
    const product = await Product.findOne({
      slug,
      isActive: true,
      isListed: true,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    /* ✅ VARIANTS */
    const variants = product.variants?.length
      ? product.variants
      : product.primaryVariant
      ? [product.primaryVariant]
      : [];

    const currentVariant = variants[0] || {};

    /* ✅ RESPONSE */
    return NextResponse.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        productKey: product.productKey,
        description: product.description,
        shortDescription: product.shortDescription,
        images: product.images,

        sellingPrice:
          currentVariant?.sellingPrice || product.sellingPrice,
        mrp: currentVariant?.mrp || product.mrp,
        stock: currentVariant?.stock || 0,
      },
      variants,
    });
  } catch (err) {
    console.error("API ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
