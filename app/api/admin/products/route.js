import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Inventory from "@/models/Inventory";
import Warehouse from "@/models/Warehouse";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

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
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

/* ================= SLUG ================= */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

/* ================= SKU ================= */
async function generateSKU() {
  const count = await Product.countDocuments();
  return `NAT-${String(count + 1).padStart(5, "0")}`;
}

/* ================= GET PRODUCTS ================= */
export async function GET(req) {
  try {
    await connectDB();

    const { error, status } = await verifyAdmin(req);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const products = await Product.find({})
      .populate("warehouse", "name code")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: products,
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const { error, status } = await verifyAdmin(req);
    if (error) {
      await session.abortTransaction();
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const body = await req.json();

    if (!body.name || !body.price || !body.warehouse) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Name, Price & Warehouse required" },
        { status: 400 }
      );
    }

    /* ================= VALIDATE WAREHOUSE ================= */
    const warehouse = await Warehouse.findById(body.warehouse);
    if (!warehouse) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Invalid warehouse" },
        { status: 400 }
      );
    }

    const slug = generateSlug(body.name);

    const existing = await Product.findOne({ slug });
    if (existing) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Product already exists" },
        { status: 400 }
      );
    }

    const sku = await generateSKU();

    /* ================= CREATE PRODUCT ================= */
    const product = await Product.create(
      [
        {
          ...body,
          slug,
          sku,
          alt: body.name,
          price: Number(body.price),
          mrp: Number(body.mrp || 0),
          costPrice: Number(body.costPrice || 0),
        },
      ],
      { session }
    );

    const createdProduct = product[0];

    /* ================= CREATE INVENTORY ================= */
    await Inventory.create(
      [
        {
          productId: createdProduct._id,
          warehouseId: warehouse._id,
          availableQty: Number(body.stock || 0),
          reservedQty: 0,
          shippedQty: 0,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      data: createdProduct,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("CREATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Failed to create product" },
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
      return NextResponse.json({ success: false, message: error }, { status });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug required" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ slug });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    /* ALSO DELETE INVENTORY */
    await Inventory.deleteMany({ productId: product._id });

    await Product.deleteOne({ slug });

    return NextResponse.json({
      success: true,
      message: "Product & inventory deleted",
    });

  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
