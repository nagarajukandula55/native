export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "../../../../../lib/db"
import Sku from "../../../../../models/Sku"

export async function GET(req, { params }) {
  try {
    const { id } = params
    await connectDB()
    const sku = await Sku.findById(id).populate("product").populate("warehouse")
    if (!sku) return NextResponse.json({ success: false, error: "SKU not found" })
    return NextResponse.json({ success: true, sku })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
