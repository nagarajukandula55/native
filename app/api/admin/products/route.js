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
  return name
    .toLowerCase()
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}

/* GET ALL PRODUCTS */

export async function GET() {

  try {

    await connectDB()

    const products = await Product.find().sort({ createdAt: -1 })

    return NextResponse.json(products)

  } catch (error) {

    console.error("GET PRODUCTS ERROR:", error)

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )

  }

}

/* CREATE PRODUCT */

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

    const product = await Product.create({

      name: body.name,

      description: body.description,

      price: body.price,

      category: body.category,

      stock: body.stock,

      featured: body.featured || false,

      image: body.image,

      alt: body.name,

      slug: slug

    })

    return NextResponse.json(product)

  } catch (error) {

    console.error("CREATE PRODUCT ERROR:", error)

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )

  }

}
