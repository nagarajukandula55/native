import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

/* ================= VERIFY ADMIN ================= */
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

/* ================= HELPER ================= */
function generateSlug(name) {
  return name.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "");
}

function generateSKU(name) {
  const firstWord = name.split(" ")[0].toUpperCase();
  const serial = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `NA${firstWord}${serial}`;
}

function autoGenerateTags(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  return text.match(/\b\w+\b/g).slice(0, 10); // top 10 words as tags
}

function autoGenerateSEO(name, description) {
  const seoTitle = `${name} | Buy Online`;
  const seoDescription = description.slice(0, 160);
  return { seoTitle, seoDescription };
}

function getGstDetails(gstCategory) {
  const gstMapping = {
    "Food - Batter Mix": { hsnCode: "19019010", gstPercent: 5 },
    "Food - Spices": { hsnCode: "09041100", gstPercent: 5 },
    "Food - Chutney Mix": { hsnCode: "21039090", gstPercent: 5 },
    "Food - Honey": { hsnCode: "04090090", gstPercent: 5 },
    "Food - Masala": { hsnCode: "09109910", gstPercent: 5 },
    "Food - Cold Pressed Oil": { hsnCode: "15159090", gstPercent: 5 },
  };
  return gstMapping[gstCategory] || { hsnCode: "00000000", gstPercent: 0 };
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
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}

/* ================= CREATE PRODUCT ================= */
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    if (!body.name || !body.description || !body.category || !body.gstCategory) {
      return NextResponse.json({ success: false, message: "Required fields missing" }, { status: 400 });
    }

    const slug = generateSlug(body.name);
    const existing = await Product.findOne({ slug });
    if (existing) return NextResponse.json({ success: false, message: "Product exists" }, { status: 400 });

    const sku = generateSKU(body.name);
    const { hsnCode, gstPercent } = getGstDetails(body.gstCategory);
    const tags = autoGenerateTags(body.name, body.description);
    const { seoTitle, seoDescription } = autoGenerateSEO(body.name, body.description);

    const sellingPrice = body.sellingPrice || body.mrp;
    const discountPercent = body.discountPercent || 0;

    const product = await Product.create({
      ...body,
      slug,
      sku,
      hsnCode,
      gstPercent,
      tags,
      seoTitle,
      seoDescription,
      sellingPrice: sellingPrice - (sellingPrice * discountPercent) / 100,
      status: "active",
    });

    return NextResponse.json({ success: true, product });

  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}

/* ================= UPDATE PRODUCT ================= */
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { productId, updates } = await req.json();
    if (!productId) return NextResponse.json({ success: false, message: "Product ID required" }, { status: 400 });

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });

    // Auto SEO & Tags
    const tags = autoGenerateTags(updates.name || product.name, updates.description || product.description);
    const { seoTitle, seoDescription } = autoGenerateSEO(updates.name || product.name, updates.description || product.description);

    if (updates.gstCategory) {
      const { hsnCode, gstPercent } = getGstDetails(updates.gstCategory);
      updates.hsnCode = hsnCode;
      updates.gstPercent = gstPercent;
    }

    if (updates.discountPercent != null && updates.sellingPrice != null) {
      updates.sellingPrice = updates.sellingPrice - (updates.sellingPrice * updates.discountPercent) / 100;
    }

    updates.tags = tags;
    updates.seoTitle = seoTitle;
    updates.seoDescription = seoDescription;

    updates.updatedAt = new Date();

    const updated = await Product.findByIdAndUpdate(productId, updates, { new: true });

    return NextResponse.json({ success: true, product: updated });

  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}
