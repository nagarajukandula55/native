import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
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

/* ================= GENERATE SKU ================= */
async function generateSKU(name) {
  const cleanedName = name.replace(/^Native\s+/i, "");
  const firstWord = cleanedName.split(" ")[0].toUpperCase();
  const count = (await Product.countDocuments({ name: new RegExp(`^${firstWord}`, "i") })) + 1;
  const serial = String(count).padStart(3, "0");
  return `NA${firstWord}${serial}`;
}

/* ================= GET PRODUCTS ================= */
export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    const status = err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message }, { status });
  }
}

/* ================= CREATE PRODUCT ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();

    if (!body.name || !body.category || !body.gstCategory || !body.price) {
      return NextResponse.json({ success: false, message: "Missing mandatory fields" }, { status: 400 });
    }

    const slug = slugify(body.name, { lower: true, strict: true });

    const existing = await Product.findOne({ slug });
    if (existing) return NextResponse.json({ success: false, message: "Product already exists" }, { status: 400 });

    const sku = await generateSKU(body.name);

    const product = await Product.create({
      ...body,
      slug,
      sku,
      alt: body.name,
      seoTitle: body.name,
      seoDescription: body.description?.substring(0, 160) || body.name,
      tags: body.name.split(" ").map(t => t.toLowerCase()),
      active: true,
    });

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    const status = err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status });
  }
}

/* ================= UPDATE PRODUCT ================= */
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    if (!body._id) return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });

    const product = await Product.findById(body._id);
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });

    Object.assign(product, {
      ...body,
      slug: slugify(body.name, { lower: true, strict: true }),
      seoTitle: body.name,
      seoDescription: body.description?.substring(0, 160) || body.name,
      tags: body.name.split(" ").map(t => t.toLowerCase()),
    });

    await product.save();
    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    const status = err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status });
  }
}
