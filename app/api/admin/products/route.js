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
// Example: "Native Idly Mix" => "NAIDLY001"
async function generateSKU(name) {
  const firstWord = name.replace(/^Native\s+/i, "").split(" ")[0].toUpperCase()
  const count = await Product.countDocuments({ name: new RegExp(`^Native ${firstWord}`, "i") }) + 1
  const serial = String(count).padStart(3, "0")
  return `NA${firstWord}${serial}`
}

/* HSN & GST MAP based on category */
const categoryHSNGST = {
  "Idly Mix": { hsn: "1905", gst: 5 },
  "Dosa Mix": { hsn: "1905", gst: 5 },
  "Spice Mix": { hsn: "2103", gst: 12 },
  "Instant Mix": { hsn: "1905", gst: 5 },
  "Snacks": { hsn: "2106", gst: 18 },
  // add more categories here
}

/* GET ALL PRODUCTS */
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

/* CREATE PRODUCT */
export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    const slug = generateSlug(body.name)

    // Check duplicate slug
    const existing = await Product.findOne({ slug })
    if (existing) {
      return NextResponse.json({ error: "Product with this name already exists" }, { status: 400 })
    }

    // Generate SKU
    const sku = await generateSKU(body.name)

    // Auto-set HSN and GST based on category if not provided
    let hsn = body.hsn || ""
    let gst = body.gst || 0
    if (body.category && categoryHSNGST[body.category]) {
      hsn = categoryHSNGST[body.category].hsn
      gst = categoryHSNGST[body.category].gst
    }

    const product = await Product.create({
      ...body,
      slug,
      sku,
      hsn,
      gst,
      alt: body.name
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
