import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

/* ================= GET PUBLIC PRODUCTS ================= */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;

    const skip = (page - 1) * limit;

    /* ===== FILTER ===== */
    let filter = { status: "active" };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    /* ===== QUERY ===== */
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    /* ===== FORMAT RESPONSE ===== */
    const formatted = products.map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      sellingPrice: p.sellingPrice,
      mrp: p.mrp,
      discountPercent: p.discountPercent,
      image: p.featuredImage || p.images?.[0] || null,
      category: p.category,
      tags: p.tags,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    }));

    return NextResponse.json({
      success: true,
      products: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("PUBLIC PRODUCTS ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
