import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

/* ================= GET PRODUCTS ================= */

export async function GET(req) {
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

    /* ================= QUERY PARAMS ================= */

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");     // review / approved / listed
    const search = searchParams.get("search");     // name / sku
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    const skip = (page - 1) * limit;

    /* ================= BUILD QUERY ================= */

    let query = {};

    // 🔥 ROLE BASED FILTER
    if (decoded.role === "vendor") {
      query.createdBy = decoded.id; // only own products
    }

    // 🔥 STATUS FILTER
    if (status) {
      query.status = status;
    }

    // 🔥 SEARCH FILTER
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    /* ================= FETCH ================= */

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

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
    console.error("GET PRODUCTS ERROR:", err);

    return NextResponse.json(
      { success: false, products: [] },
      { status: 500 }
    );
  }
}
