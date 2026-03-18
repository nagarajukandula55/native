import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Product from "@/models/Product"

const MONGODB_URI = process.env.MONGODB_URI

async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(MONGODB_URI)
}

/* SLUG GENERATOR */
function generateSlug(name) {
  return name.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "")
}

/* SKU GENERATOR */
// Example: "Native Dosa Mix" => NADOSA001
async function generateSKU(name) {
  const cleanedName = name.replace(/^Native\s+/i, "")
  const firstWord = cleanedName.split(" ")[0].toUpperCase()
  const count = await Product.countDocuments({ name: new RegExp(`^${firstWord}`, "i") }) + 1
  const serial = String(count).padStart(3, "0")
  return `NA${firstWord}${serial}`
}

/* GET ALL PRODUCTS */
export async function GET() {
  try {
    await connectDB()
    const products = await Product.find().sort({ createdAt: -1 })
    return NextResponse.json(products)
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

/* CREATE PRODUCT */
export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    const slug = generateSlug(body.name)

    // Check duplicate
    const existing = await Product.findOne({ slug })
    if (existing)
      return NextResponse.json({ error: "Product with this name already exists" }, { status: 400 })

    const sku = await generateSKU(body.name)

    const product = await Product.create({
      ...body,
      slug,
      sku,
      alt: body.name,
      warehouse: body.warehouse || "", // <-- SAVE selected warehouse
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

/* DELETE PRODUCT */
export async function DELETE(req, { params }) {
  try {
    await connectDB()
    const { slug } = params
    await Product.deleteOne({ slug })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
