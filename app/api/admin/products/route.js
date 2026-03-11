import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"
import slugify from "slugify"

export async function GET() {
  await connectDB()

  const products = await Product.find().sort({ createdAt: -1 })

  return NextResponse.json(products)
}

export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json()

    const product = await Product.create({
      name: body.name,
      slug: slugify(body.name, { lower: true }),
      price: body.price,
      description: body.description,
      category: body.category,
      stock: body.stock,
      featured: body.featured,
      image: body.image
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
