import { NextResponse } from "next/server"
import connectDB from "../../../../../lib/db"
import Sku from "../../../../../models/Sku"

export const dynamic = "force-dynamic"

export async function GET(req, { params }) {
  try {
    await connectDB()
    const sku = await Sku.findById(params.id)
      .populate("product")
      .populate("warehouse")

    if (!sku) return NextResponse.json({ success: false, error: "SKU not found" })

    return NextResponse.json({ success: true, sku })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
