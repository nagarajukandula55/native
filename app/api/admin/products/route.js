import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Product from "@/models/Product"

const MONGODB_URI = process.env.MONGODB_URI

async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(MONGODB_URI)
}

function generateSlug(name) {
  return name.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "")
}

// SKU Generator
async function generateSKU(name) {
  const firstWord = name.replace(/^Native\s+/i, "").split(" ")[0].toUpperCase()
  const count = await Product.countDocuments({ name: new RegExp(`^Native ${firstWord}`, "i") }) + 1
  const serial = String(count).padStart(3, "0")
  return `NA${firstWord}${serial}`
}

// HSN -> GST map
const hsnOptions = {
  "1905": 5,
  "2103": 12,
  "2106": 18,
}

/* GET ALL PRODUCTS */
export async function GET() {
  try {
    await connectDB()
    const products = await Product.find().sort({ createdAt: -1 })
    return NextResponse.json({ success: true, products })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

/* CREATE PRODUCT */
export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()

    const slug = generateSlug(body.name)
    const existing = await Product.findOne({ slug })
    if (existing) {
      return NextResponse.json({ success: false, error: "Product with this name already exists" }, { status: 400 })
    }

    const sku = await generateSKU(body.name)

    // Set GST based on HSN if not provided
    let gst = body.gst || 0
    if (body.hsn && hsnOptions[body.hsn]) {
      gst = hsnOptions[body.hsn]
    }

    const product = await Product.create({
      ...body,
      slug,
      sku,
      gst,
      alt: body.name,
    })

    return NextResponse.json({ success: true, product })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}

/* DELETE PRODUCT */
export async function DELETE(req) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    if (!slug) return NextResponse.json({ success: false, error: "Missing slug" }, { status: 400 })

    await Product.deleteOne({ slug })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 })
  }
}
