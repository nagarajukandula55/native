import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status"); // review / approved

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    const match = {};

    // 🔥 CORE FIX
    if (status) {
      match.status = status;
    } else {
      match.status = "approved";
      match.isActive = true;
    }

    const pipeline = [
      { $match: match },

      { $sort: { createdAt: -1 } },

      {
        $group: {
          _id: "$productKey",

          name: { $first: "$name" },
          productKey: { $first: "$productKey" },
          category: { $first: "$category" },

          slug: { $first: "$slug" },
          images: { $first: "$images" },

          price: { $first: "$sellingPrice" },
          mrp: { $first: "$mrp" },

          createdAt: { $first: "$createdAt" },

          variants: {
            $push: {
              variant: "$variant",
              sku: "$sku",
              mrp: "$mrp",
              sellingPrice: "$sellingPrice",
            },
          },
        },
      },

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
      products: result[0]?.data || [],
      total: result[0]?.totalCount[0]?.count || 0,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
