export const dynamic = "force-dynamic"

import connectDB from "@/lib/db"
import Sku from "@/models/Sku"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    if (!body._id) throw new Error("SKU _id is required")
    await Sku.findByIdAndUpdate(body._id, body)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("SKU UPDATE ERROR:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
