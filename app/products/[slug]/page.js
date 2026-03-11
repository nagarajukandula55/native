import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Product from "@/models/Product"

const MONGODB_URI = process.env.MONGODB_URI

async function connectDB() {

  if (mongoose.connection.readyState === 1) return

  await mongoose.connect(MONGODB_URI)

}


/* GET PRODUCT BY SLUG */

export async function GET(req, { params }) {

  try {

    await connectDB()

    const product = await Product.findOne({
      slug: params.slug
    })

    if (!product) {

      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )

    }

    return NextResponse.json(product)

  }

  catch (error) {

    console.error("GET PRODUCT ERROR:", error)

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )

  }

}


/* DELETE PRODUCT */

export async function DELETE(req, { params }) {

  try {

    await connectDB()

    await Product.findOneAndDelete({
      slug: params.slug
    })

    return NextResponse.json({
      message: "Product deleted"
    })

  }

  catch (error) {

    console.error("DELETE PRODUCT ERROR:", error)

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )

  }

}


/* UPDATE PRODUCT */

export async function PUT(req, { params }) {

  try {

    await connectDB()

    const body = await req.json()

    const updatedProduct = await Product.findOneAndUpdate(
      { slug: params.slug },
      body,
      { new: true }
    )

    return NextResponse.json(updatedProduct)

  }

  catch (error) {

    console.error("UPDATE PRODUCT ERROR:", error)

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )

  }

}
