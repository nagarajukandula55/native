export const dynamic = "force-dynamic"

import connectDB from "../../../../../lib/db"
import Sku from "../../../../../models/Sku"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    await connectDB()
    const { id, value } = await req.json()

    await Sku.findByIdAndUpdate(id, { isActive: value })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("SKU TOGGLE ERROR:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
