export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Sku from "@/models/Sku"

export async function GET() {
  try {
    await connectDB()
    const skus = await Sku.find({})
      .populate("product")
      .populate("warehouse")
    return NextResponse.json({ success: true, skus })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
