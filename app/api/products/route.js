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

    /* ================= MATCH FILTER ================= */
    const match = {
      status: "approved",
      isActive: true,
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

      /* sort FIRST (important for correct grouping) */
      { $sort: { sellingPrice: 1 } },

      /* ================= GROUP PRODUCT ================= */
      {
        $group: {
          _id: "$productKey",

          name: { $first: "$name" },
          productKey: { $first: "$productKey" },
          category: { $first: "$category" },
          slug: { $first: "$slug" },

          images: { $first: "$images" },

          /* PRICE RANGE SUPPORT (IMPORTANT) */
          minPrice: { $min: "$sellingPrice" },
          maxPrice: { $max: "$sellingPrice" },
          mrp: { $first: "$mrp" },

          /* GST READY FIELDS */
          tax: { $first: "$tax" },
          gstCategory: { $first: "$gstCategory" },

          createdAt: { $first: "$createdAt" },

          variantsCount: { $sum: 1 },

          /* future SKU tracking support */
          skus: { $push: "$sku" },
        },
      },

      /* ================= SAFE DISCOUNT CALC ================= */
      {
        $addFields: {
          discount: {
            $cond: [
              {
                $and: [
                  { $gt: ["$mrp", 0] },
                  { $gt: ["$minPrice", 0] }
                ],
              },
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

          /* FINAL DISPLAY PRICE (PUBLIC) */
          displayPrice: "$minPrice",
        },
      },

      { $sort: { createdAt: -1 } },

      /* ================= PAGINATION ================= */
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
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
      { success: false, products: [] },
      { status: 500 }
    );
  }
}
