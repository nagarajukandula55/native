import { NextResponse } from "next/server"
import connectDB from "../../../../lib/db"
import Sku from "../../../../models/Sku"

export const dynamic = "force-dynamic"

export async function POST(req) {
  try {
    const body = await req.json()
    await connectDB()

    const { code, partCode, product, warehouse, price, stock, isActive } = body

    if (!code || !product || !warehouse || !price) {
      return NextResponse.json({ success: false, error: "Missing required SKU fields" })
    }

    const existing = await Sku.findOne({ code })
    if (existing) {
      return NextResponse.json({ success: false, error: "SKU code already exists" })
    }

    const sku = new Sku({
      code,
      partCode,
      product,
      warehouse,
      price,
      stock: stock || 0,
      isActive: isActive ?? true
    })

    await sku.save()

    return NextResponse.json({ success: true, sku })

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
