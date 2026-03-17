export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Sku from "@/models/Sku"

export async function POST(req) {
  try {
    const body = await req.json()
    await connectDB()

    const sku = await Sku.findById(body.id)
    if (!sku) return NextResponse.json({ success: false, error: "SKU not found" })

    sku.code = body.code ?? sku.code
    sku.partCode = body.partCode ?? sku.partCode
    sku.product = body.product ?? sku.product
    sku.warehouse = body.warehouse ?? sku.warehouse
    sku.price = body.price ?? sku.price
    sku.stock = body.stock ?? sku.stock
    sku.isActive = body.isActive ?? sku.isActive

    await sku.save()
    return NextResponse.json({ success: true, sku })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
