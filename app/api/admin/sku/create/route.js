export const dynamic = "force-dynamic"

import connectDB from "@/lib/db"
import SKU from "@/models/SKU"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    await connectDB()

    const body = await req.json()

    if (!body.productId)
      return NextResponse.json(
        { success: false, message: "Product required" },
        { status: 400 }
      )

    const sku = await SKU.create(body)

    return NextResponse.json({
      success: true,
      data: sku
    })
  } catch (err) {
    console.log("SKU CREATE ERROR:", err)

    return NextResponse.json(
      {
        success: false,
        message: err.message
      },
      { status: 500 }
    )
  }
}
