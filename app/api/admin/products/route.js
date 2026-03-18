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
  const firstWord = name.split(" ")[0].toUpperCase();
  const count = await Product.countDocuments({ name: new RegExp(`^${firstWord}`, "i") }) + 1;
  const serial = String(count).padStart(3, "0");
  return `NA${firstWord}${serial}`;
}

// HSN & GST mapping for dropdown
export const HSN_LIST = [
  { hsn: "1905", gst: 5, description: "Idly / Dosa Mix" },
  { hsn: "2103", gst: 12, description: "Spice Mix" },
  { hsn: "2106", gst: 18, description: "Snacks" },
  { hsn: "1905", gst: 5, description: "Instant Mix" },
];

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products: Array.isArray(products) ? products : [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, products: [] });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const slug = generateSlug(body.name);
    const existing = await Product.findOne({ slug });
    if (existing) return NextResponse.json({ error: "Product already exists" }, { status: 400 });

    const sku = await generateSKU(body.name);

    const product = await Product.create({ ...body, slug, sku, alt: body.name });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const slug = params.slug;
    await Product.findOneAndDelete({ slug });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
