import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getProductDisplayName } from "@/lib/product";

export const dynamic = "force-dynamic";

/* ================= GET PRODUCTS ================= */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    const category = searchParams.get("category");
    const search = searchParams.get("search");

    /* ================= FILTER ================= */
    const match = {
      status: "approved",
      isActive: true,
      isListed: true,
    };

    if (category) {
      match.category = category;
    }

    if (search) {
      match.name = { $regex: search, $options: "i" };
    }

    /* ================= PIPELINE ================= */
    const pipeline = [
      { $match: match },

      {
        $sort: {
          "primaryVariant.sellingPrice": 1,
        },
      },

      /* ================= GROUP ================= */
      {
        $group: {
          _id: "$productKey",
          mongoId: { $first: "$_id" },
          realId: { $first: "$_id" },

          name: { $first: "$name" },
          brand: { $first: "$brand" }, // ✅ IMPORTANT (needed for display name)

          productKey: { $first: "$productKey" },
          slug: { $first: "$slug" },
          category: { $first: "$category" },

          images: { $first: "$images" },

          mrp: { $max: "$primaryVariant.mrp" },
          minPrice: { $min: "$primaryVariant.sellingPrice" },
          maxPrice: { $max: "$primaryVariant.sellingPrice" },

          tax: { $first: "$tax" },
          gstCategory: { $first: "$gstCategory" },

          createdAt: { $first: "$createdAt" },

          variantsCount: { $sum: 1 },
          skus: { $push: "$primaryVariant.sku" },
        },
      },

      /* ================= CALCULATIONS ================= */
      {
        $addFields: {
          discount: {
            $cond: [
              { $gt: ["$mrp", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$mrp", "$minPrice"] },
                          "$mrp",
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
              0,
            ],
          },

          displayPrice: "$minPrice",
        },
      },

      { $sort: { createdAt: -1 } },

      /* ================= PAGINATION ================= */
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [
            { $count: "count" },
          ],
        },
      },
    ];

    const result = await Product.aggregate(pipeline);

    const products = result?.[0]?.data || [];

    /* ================= ADD DISPLAY NAME HERE ================= */
    const enrichedProducts = products.map((p) => ({
      ...p,
      _id: p.mongoId || p._id,
      displayName: getProductDisplayName(p),
    }));

    return NextResponse.json({
      success: true,
      products: enrichedProducts,
      total: result?.[0]?.totalCount?.[0]?.count || 0,
      page,
      limit,
    });
  } catch (err) {
    console.error("PUBLIC PRODUCTS ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
        products: [],
      },
      { status: 500 }
    );
  }
}
