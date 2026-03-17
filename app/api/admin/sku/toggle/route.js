export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Sku from "@/models/Sku"

export async function POST(req) {
  try {
    const { id, value } = await req.json()
    await connectDB()
    const sku = await Sku.findByIdAndUpdate(id, { isActive: value }, { new: true })
    return NextResponse.json({ success: true, sku })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
