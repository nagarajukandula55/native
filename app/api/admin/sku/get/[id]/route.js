export const dynamic = "force-dynamic"

import connectDB from "../../../../../lib/db"
import Sku from "../../../../../models/Sku"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  try {
    await connectDB()

    const sku = await Sku.findById(params.id)
      .populate("product", "name")
      .populate("warehouse", "name city code")

    if (!sku) {
      return NextResponse.json({ success: false, error: "SKU not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, sku })
  } catch (err) {
    console.error("SKU GET ERROR:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
