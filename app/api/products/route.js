import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    /* ================= PARAMS ================= */
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;

    const category = searchParams.get("category");
    const minPrice = parseInt(searchParams.get("minPrice"));
    const maxPrice = parseInt(searchParams.get("maxPrice"));
    const sort = searchParams.get("sort");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    /* ================= MATCH STAGE ================= */
    const matchStage = { isActive: true };

    if (category) {
      matchStage.category = category;
    }

    if (search) {
      matchStage.name = { $regex: search, $options: "i" };
    }

    /* ================= PIPELINE ================= */
    const pipeline = [
      { $match: matchStage },

      /* 🔥 SORT VARIANTS BY PRICE FIRST */
      { $sort: { sellingPrice: 1 } },

      /* 🔥 GROUP BY productKey */
      {
        $group: {
          _id: "$productKey",
          name: { $first: "$name" },
          productKey: { $first: "$productKey" },
          category: { $first: "$category" },

          slug: { $first: "$slug" },
          image: { $first: { $arrayElemAt: ["$images", 0] } },

          price: { $first: "$sellingPrice" },
          mrp: { $first: "$mrp" },

          createdAt: { $first: "$createdAt" },

          variantsCount: { $sum: 1 },
        },
      },

      /* 🔥 ADD DISCOUNT */
      {
        $addFields: {
          discount: {
            $cond: [
              { $and: ["$mrp", "$price"] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: ["$mrp", "$price"] },
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
        },
      },

      /* ================= PRICE FILTER ================= */
      ...(minPrice || maxPrice
        ? [
            {
              $match: {
                ...(minPrice ? { price: { $gte: minPrice } } : {}),
                ...(maxPrice ? { price: { $lte: maxPrice } } : {}),
              },
            },
          ]
        : []),

      /* ================= SORT ================= */
      {
        $sort:
          sort === "price_asc"
            ? { price: 1 }
            : sort === "price_desc"
            ? { price: -1 }
            : { createdAt: -1 },
      },

      /* ================= FACET (DATA + COUNT) ================= */
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [
            { $count: "count" }
          ],
        },
      },
    ];

    const result = await Product.aggregate(pipeline);

    const products = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("AGGREGATION ERROR:", err);

    return NextResponse.json(
      { success: false, products: [] },
      { status: 500 }
    );
  }
}
