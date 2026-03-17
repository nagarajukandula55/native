import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Product from "@/models/Product"

const MONGODB_URI = process.env.MONGODB_URI

async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(MONGODB_URI)
}

/* ---------------- SLUG GENERATOR ---------------- */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}

/* ---------------- SKU GENERATOR ---------------- */
// Example: "Native Idly Mix" => "NAIDLY001"
async function generateSKU(name) {
  const firstWord = name.replace(/^Native\s+/i,'').split(' ')[0].toUpperCase()
  const count = await Product.countDocuments({ name: new RegExp(firstWord, "i") }) + 1
  const serial = String(count).padStart(3,'0')
  return `NA${firstWord}${serial}`
}

/* ---------------- GET ALL PRODUCTS ---------------- */
export async function GET() {
  try {
    await connectDB()
    const products = await Product.find().sort({ createdAt: -1 })
    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

/* ---------------- CREATE PRODUCT ---------------- */
export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    const slug = generateSlug(body.name)

    /* CHECK DUPLICATE SLUG */
    const existing = await Product.findOne({ slug })
    if (existing) {
      return NextResponse.json(
        { error: "Product with this name already exists" },
        { status: 400 }
      )
    }

    /* GENERATE SKU */
    const sku = await generateSKU(body.name)

    /* CREATE PRODUCT */
    const product = await Product.create({
      name: body.name,
      description: body.description || "",
      price: body.price || 0,
      mrp: body.mrp || 0,
      costPrice: body.costPrice || 0,
      category: body.category || "",
      brand: body.brand || "",
      stock: body.stock || 0,
      reorderLevel: body.reorderLevel || 5,
      hsn: body.hsn || "",
      gst: body.gst || 0,
      weight: body.weight || 0,
      length: body.length || 0,
      breadth: body.breadth || 0,
      height: body.height || 0,
      featured: body.featured || false,
      status: body.status || "ACTIVE",
      image: body.image || "",
      alt: body.name,
      slug,
      sku
    })

    return NextResponse.json({ success: true, product })

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
