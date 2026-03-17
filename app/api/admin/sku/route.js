export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "../../../../lib/db"
import Sku from "../../../../models/Sku"

export async function POST(req) {
  try {
    const body = await req.json()
    await connectDB()

    const existing = await Sku.findOne({ code: body.code })
    if (existing) {
      return NextResponse.json({ success: false, error: "SKU code already exists" })
    }

    const sku = new Sku({
      code: body.code,
      partCode: body.partCode,
      product: body.product,
      warehouse: body.warehouse,
      price: body.price,
      stock: body.stock,
      isActive: body.isActive ?? true,
    })

    await sku.save()

    return NextResponse.json({ success: true, sku })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
