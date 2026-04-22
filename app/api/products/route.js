import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    /* ================= QUERY PARAMS ================= */
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;

    const category = searchParams.get("category");
    const minPrice = parseInt(searchParams.get("minPrice"));
    const maxPrice = parseInt(searchParams.get("maxPrice"));
    const sort = searchParams.get("sort"); // price_asc, price_desc, latest
    const search = searchParams.get("search");

    /* ================= BASE QUERY ================= */
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    /* ================= FETCH ================= */
    const products = await Product.find(query).lean();

    /* ================= GROUP ================= */
    const grouped = {};

    for (let p of products) {
      if (!grouped[p.productKey]) {
        grouped[p.productKey] = [];
      }
      grouped[p.productKey].push(p);
    }

    /* ================= BUILD ================= */
    let finalProducts = Object.values(grouped).map((variants) => {
      variants.sort((a, b) => a.sellingPrice - b.sellingPrice);

      const best = variants[0];

      const discount =
        best.mrp && best.sellingPrice
          ? Math.round(((best.mrp - best.sellingPrice) / best.mrp) * 100)
          : 0;

      return {
        _id: best._id,
        name: best.name,
        productKey: best.productKey,
        category: best.category,

        slug: best.slug,
        image: best.images?.[0] || "",

        price: best.sellingPrice,
        mrp: best.mrp,
        discount,

        variantsCount: variants.length,
        createdAt: best.createdAt,
      };
    });

    /* ================= PRICE FILTER ================= */
    if (!isNaN(minPrice)) {
      finalProducts = finalProducts.filter((p) => p.price >= minPrice);
    }

    if (!isNaN(maxPrice)) {
      finalProducts = finalProducts.filter((p) => p.price <= maxPrice);
    }

    /* ================= SORT ================= */
    if (sort === "price_asc") {
      finalProducts.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      finalProducts.sort((a, b) => b.price - a.price);
    } else {
      // latest
      finalProducts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    /* ================= PAGINATION ================= */
    const total = finalProducts.length;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = finalProducts.slice(start, end);

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      products: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("FILTER API ERROR:", err);

    return NextResponse.json(
      { success: false, products: [] },
      { status: 500 }
    );
  }
}
