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
  const count = await Product.countDocuments({ name: new RegExp(`^Native ${firstWord}`, "i") }) + 1
  return `NA${firstWord}${String(count).padStart(3, "0")}`
}

export async function GET() {
  try {
    await connectDB()
    const products = await Product.find().sort({ createdAt: -1 })
    return NextResponse.json({ success: true, products })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: true, products: [] })
  }
}

export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    const slug = generateSlug(body.name)
    const existing = await Product.findOne({ slug })
    if (existing) return NextResponse.json({ error: "Product already exists" }, { status: 400 })
    const sku = await generateSKU(body.name)
    const product = await Product.create({ ...body, slug, sku })
    return NextResponse.json({ success: true, product })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    await Product.deleteOne({ slug })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
