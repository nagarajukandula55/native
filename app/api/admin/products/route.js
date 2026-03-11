import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Product from "@/models/Product"

const MONGODB_URI = process.env.MONGODB_URI

async function connectDB() {
  if (mongoose.connections[0].readyState) return
  await mongoose.connect(MONGODB_URI)
}

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

export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json()

    const {
      name,
      description,
      price,
      image,
      alt,
      category,
      stock,
      featured,
      slug
    } = body

    const product = await Product.create({
      name,
      description,
      price,
      image,
      alt,
      category,
      stock,
      featured,
      slug
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
