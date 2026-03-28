import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

const MONGODB_URI = process.env.MONGODB_URI;

export const dynamic = "force-dynamic";

/* ================= DB CONNECT ================= */
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
}

/* ================= VERIFY ADMIN ================= */
async function verifyAdmin(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) return { error: "Unauthorized", status: 401 };

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return { error: "Forbidden", status: 403 };
    }

    return { user: decoded };
  } catch (err) {
    return { error: "Invalid token", status: 401 };
  }
}

/* ================= SLUG ================= */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

/* ================= SKU ================= */
async function generateSKU(name) {
  const cleanedName = name.replace(/^Native\s+/i, "");
  const firstWord = cleanedName.split(" ")[0].toUpperCase();

  const count =
    (await Product.countDocuments({
      name: new RegExp(`^${firstWord}`, "i"),
    })) + 1;

  const serial = String(count).padStart(3, "0");

  return `NA${firstWord}${serial}`;
}

/* ================= GET PRODUCTS ================= */
export async function GET(req) {
  try {
    await connectDB();

    const { error, status } = await verifyAdmin(req);
    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status }
      );
    }

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: products.length,
      products, // ✅ FIXED
    });

  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/* ================= CREATE PRODUCT ================= */
export async function POST(req) {
  try {
    await connectDB();

    const { error, status } = await verifyAdmin(req);
    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status }
      );
    }

    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: "Product name required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(body.name);

    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Product already exists" },
        { status: 400 }
      );
    }

    const sku = await generateSKU(body.name);

    const product = await Product.create({
      ...body,
      slug,
      sku,
      alt: body.name,
    });

    return NextResponse.json({
      success: true,
      product,
    });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}

/* ================= DELETE PRODUCT ================= */
export async function DELETE(req) {
  try {
    await connectDB();

    const { error, status } = await verifyAdmin(req);
    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status }
      );
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug required" },
        { status: 400 }
      );
    }

    await Product.deleteOne({ slug });

    return NextResponse.json({
      success: true,
      message: "Product deleted",
    });

  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
