import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import slugify from "slugify";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

/* ================= AUTH ================= */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.role || decoded.role !== "admin") throw new Error("Forbidden");

  return decoded;
}

/* ================= DB CONNECT ================= */
async function dbConnect() {
  await connectDB();
}

/* ================= AUTO GENERATE SEO ================= */
function generateSEO(name, description) {
  const title = `${name} - Best Quality Online`;
  const desc =
    description ||
    `Buy ${name} online at best prices. Top quality products available for fast delivery.`;
  const tags = name
    .toLowerCase()
    .split(" ")
    .concat(["buy online", "top quality", "best price"]);
  return { title, description: desc, tags };
}

/* ================= CREATE PRODUCT ================= */
export async function POST(req) {
  try {
    await dbConnect();
    await verifyAdmin(req);

    const body = await req.json();
    const {
      name,
      description,
      images,
      categoryId,
      subCategory,
      mrp,
      costPrice,
      discountPercent,
      isActive = true,
    } = body;

    if (!name || !categoryId || !images || images.length === 0 || !mrp) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const slug = slugify(name, { lower: true, strict: true });

    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Product already exists" },
        { status: 400 }
      );
    }

    // Fetch Category to get HSN/GST for Food
    const category = await Category.findById(categoryId);
    let hsn = null;
    let gstPercent = null;

    if (category?.slug === "food") {
      // Example HSN/GST mapping based on subCategory
      const mapping = {
        "batter mix": { hsn: "1901", gst: 5 },
        "spices": { hsn: "0910", gst: 5 },
        "chutney mix": { hsn: "2103", gst: 5 },
        honey: { hsn: "0409", gst: 12 },
        "masala": { hsn: "0910", gst: 5 },
        "cold pressed oil": { hsn: "1515", gst: 5 },
      };
      if (subCategory && mapping[subCategory.toLowerCase()]) {
        hsn = mapping[subCategory.toLowerCase()].hsn;
        gstPercent = mapping[subCategory.toLowerCase()].gst;
      }
    }

    const sellingPrice = mrp - (mrp * (discountPercent || 0)) / 100;

    const seo = generateSEO(name, description);

    const product = await Product.create({
      name,
      slug,
      description,
      images, // array of cloudinary URLs
      category: categoryId,
      subCategory,
      mrp,
      costPrice,
      discountPercent,
      sellingPrice,
      hsn,
      gstPercent,
      seoTitle: seo.title,
      seoDescription: seo.description,
      seoTags: seo.tags,
      isActive,
    });

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status }
    );
  }
}

/* ================= UPDATE PRODUCT ================= */
export async function PUT(req) {
  try {
    await dbConnect();
    await verifyAdmin(req);

    const body = await req.json();
    const {
      productId,
      name,
      description,
      images,
      categoryId,
      subCategory,
      mrp,
      costPrice,
      discountPercent,
      isActive,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (images) product.images = images;
    if (categoryId) product.category = categoryId;
    if (subCategory) product.subCategory = subCategory;
    if (mrp) product.mrp = mrp;
    if (costPrice) product.costPrice = costPrice;
    if (discountPercent !== undefined) product.discountPercent = discountPercent;
    if (mrp || discountPercent !== undefined)
      product.sellingPrice = product.mrp - (product.mrp * (product.discountPercent || 0)) / 100;
    if (isActive !== undefined) product.isActive = isActive;

    // Recalculate HSN/GST if category is food
    const category = await Category.findById(product.category);
    if (category?.slug === "food") {
      const mapping = {
        "batter mix": { hsn: "1901", gst: 5 },
        "spices": { hsn: "0910", gst: 5 },
        "chutney mix": { hsn: "2103", gst: 5 },
        honey: { hsn: "0409", gst: 12 },
        "masala": { hsn: "0910", gst: 5 },
        "cold pressed oil": { hsn: "1515", gst: 5 },
      };
      if (subCategory && mapping[subCategory.toLowerCase()]) {
        product.hsn = mapping[subCategory.toLowerCase()].hsn;
        product.gstPercent = mapping[subCategory.toLowerCase()].gst;
      }
    }

    const seo = generateSEO(product.name, product.description);
    product.seoTitle = seo.title;
    product.seoDescription = seo.description;
    product.seoTags = seo.tags;

    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status }
    );
  }
}

/* ================= FETCH PRODUCTS ================= */
export async function GET(req) {
  try {
    await dbConnect();
    await verifyAdmin(req);

    const products = await Product.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error("FETCH PRODUCTS ERROR:", err);
    const status =
      err.message === "Unauthorized"
        ? 401
        : err.message === "Forbidden"
        ? 403
        : 500;
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status }
    );
  }
}
