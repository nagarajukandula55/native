import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

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
      isListed: true, // 🔥 IMPORTANT FIX (only show listed products)
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

      /* sort by price (safe nested path) */
      {
        $sort: {
          "primaryVariant.sellingPrice": 1,
        },
      },

      /* ================= GROUP BY PRODUCT ================= */
      {
        $group: {
          _id: "$productKey",
          mongoId: { $first: "$_id" }, // ✅ preserve real ID

          name: { $first: "$name" },
          
          productKey: { $first: "$productKey" },
          slug: { $first: "$slug" },
          category: { $first: "$category" },

          images: { $first: "$images" },

          /* PRICE */
          mrp: { $max: "$primaryVariant.mrp" },
          minPrice: { $min: "$primaryVariant.sellingPrice" },
          maxPrice: { $max: "$primaryVariant.sellingPrice" },

          tax: { $first: "$tax" },
          gstCategory: { $first: "$gstCategory" },

          createdAt: { $first: "$createdAt" },

          variantsCount: { $sum: 1 },

          /* SKU tracking */
          skus: { $push: "$primaryVariant.sku" },
        },
      },

      /* ================= DISCOUNT CALC ================= */
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

      /* newest first */
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

    return NextResponse.json({
      success: true,
      products: result?.[0]?.data || [],
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
