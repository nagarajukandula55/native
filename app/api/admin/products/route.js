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

async function generateSKU(name) {
  const firstWord = name.replace(/^Native\s+/i, "").split(" ")[0].toUpperCase()
  const count = await Product.countDocuments({ name: new RegExp(`^${name}`, "i") }) + 1
  const serial = String(count).padStart(3, "0")
  return `NA${firstWord}${serial}`
}

// HSN + GST map
export const HSNList = [
  { hsn: "1905", gst: 5, description: "Idly / Dosa Mix" },
  { hsn: "2103", gst: 12, description: "Spice Mix" },
  { hsn: "2106", gst: 18, description: "Snacks" },
  { hsn: "1905", gst: 5, description: "Instant Mix" },
]

export async function GET() {
  try {
    await connectDB()
    const products = await Product.find().sort({ createdAt: -1 })
    return NextResponse.json({ success: true, products: products || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, products: [] })
  }
}

export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    const slug = generateSlug(body.name)

    if (await Product.findOne({ slug })) {
      return NextResponse.json({ error: "Product with this name already exists" }, { status: 400 })
    }

    const sku = await generateSKU(body.name)
    const product = await Product.create({
      ...body,
      slug,
      sku,
      alt: body.name
    })

    return NextResponse.json({ success: true, product })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB()
    const { slug } = params
    await Product.deleteOne({ slug })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
