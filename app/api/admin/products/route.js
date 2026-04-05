import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

// Auth middleware
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.role || decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

// Generate slug
function generateSlug(name) {
  return name.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "");
}

// Generate SKU
async function generateSKU(name) {
  const cleanedName = name.replace(/^Native\s+/i, "");
  const firstWord = cleanedName.split(" ")[0].toUpperCase();
  const count = (await Product.countDocuments({ name: new RegExp(`^${firstWord}`, "i") })) + 1;
  const serial = String(count).padStart(3, "0");
  return `NA${firstWord}${serial}`;
}

export async function GET() {
  try {
    await connectDB();
    // Only admin can get products
    return NextResponse.json({
      success: true,
      products: await Product.find().sort({ createdAt: -1 }).lean(),
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const body = await req.json();
    const { name, description, costPrice, sellingPrice, mrp, images, variants, gstCategory, websiteCategory } = body;

    if (!name || !description || !costPrice || !sellingPrice || !mrp) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const slug = generateSlug(name);
    const existing = await Product.findOne({ slug });
    if (existing) return NextResponse.json({ success: false, message: "Product already exists" }, { status: 400 });

    const sku = await generateSKU(name);

    // Auto GST based on category
    let hsn = "";
    let gstPercent = 0;
    if (gstCategory === "Food") { hsn = "2106"; gstPercent = 5; }
    else if (gstCategory === "Electronics") { hsn = "8471"; gstPercent = 18; }

    // Auto SEO
    const seoTitle = `${name} - Buy Online at Best Price`;
    const seoDescription = description.slice(0, 160);

    const product = await Product.create({
      name,
      slug,
      sku,
      description,
      costPrice,
      sellingPrice,
      mrp,
      images,
      variants,
      gstCategory,
      hsn,
      gstPercent,
      websiteCategory,
      seoTitle,
      seoDescription,
      status: "Active",
    });

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    await verifyAdmin(req);
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) return NextResponse.json({ success: false, message: "Slug required" }, { status: 400 });

    await Product.deleteOne({ slug });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status: 500 });
  }
}
