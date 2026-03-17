import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Product from "@/models/Product"

const MONGODB_URI = process.env.MONGODB_URI

async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(MONGODB_URI)
}

// SLUG GENERATOR
function generateSlug(name) {
  return name.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "")
}

// SKU GENERATOR
async function generateSKU(name) {
  const firstWord = name.replace(/^Native\s+/i, "").split(" ")[0].toUpperCase()
  const count = await Product.countDocuments({ name: new RegExp(`^Native ${firstWord}`, "i") }) + 1
  const serial = String(count).padStart(3, "0")
  return `NA${firstWord}${serial}`
}

// HSN -> GST mapping
export const HSN_GST_MAP = {
  "1905": 5,
  "2103": 12,
  "2106": 18
}

/* GET ALL PRODUCTS */
export async function GET() {
  try {
    await connectDB()
    const products = await Product.find().sort({ createdAt: -1 })
    return NextResponse.json({ success: true, products: Array.isArray(products) ? products : [] })
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error)
    return NextResponse.json({ success: false, products: [] }, { status: 500 })
  }
}

/* CREATE PRODUCT */
export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    const slug = generateSlug(body.name)

    const existing = await Product.findOne({ slug })
    if (existing) return NextResponse.json({ success: false, error: "Product exists" }, { status: 400 })

    const sku = await generateSKU(body.name)
    const gst = HSN_GST_MAP[body.hsn] || body.gst || 0

    const product = await Product.create({
      ...body,
      slug,
      sku,
      gst,
      alt: body.name
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}

/* DELETE PRODUCT */
export async function DELETE(req) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    if (!slug) return NextResponse.json({ success: false, error: "Slug missing" }, { status: 400 })

    await Product.deleteOne({ slug })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 })
  }
}
