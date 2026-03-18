import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/Product";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
}

// Slug generator
function generateSlug(name) {
  return name.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "");
}

// SKU generator
async function generateSKU(name) {
  const firstWord = name.replace(/^Native\s+/i, "").split(" ")[0].toUpperCase();
  const count = await Product.countDocuments({ name: new RegExp(`^Native ${firstWord}`, "i") }) + 1;
  const serial = String(count).padStart(3, "0");
  return `NA${firstWord}${serial}`;
}

// HSN list with descriptions
export const hsnList = [
  { hsn: "1905", description: "Idly / Dosa Mix" },
  { hsn: "2103", description: "Spice Mix" },
  { hsn: "2106", description: "Snacks" },
  { hsn: "1905", description: "Instant Mix" },
];

export const hsnGSTMap = {
  "1905": 5,
  "2103": 12,
  "2106": 18,
};

// GET Products
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST Product
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const slug = generateSlug(body.name);

    const existing = await Product.findOne({ slug });
    if (existing) return NextResponse.json({ error: "Product already exists" }, { status: 400 });

    const sku = await generateSKU(body.name);

    let hsn = body.hsn || "";
    let gst = body.gst || 0;
    if (hsn && hsnGSTMap[hsn]) gst = hsnGSTMap[hsn];

    const product = await Product.create({
      ...body,
      slug,
      sku,
      hsn,
      gst,
      alt: body.name,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// DELETE Product
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await Product.deleteOne({ slug: params.slug });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
