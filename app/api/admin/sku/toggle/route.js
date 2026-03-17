import { NextResponse } from "next/server"
import connectDB from "../../../../lib/db"
import Sku from "../../../../models/Sku"

export const dynamic = "force-dynamic"

export async function POST(req) {
  try {
    const body = await req.json()
    const { id, value } = body

    if (!id) return NextResponse.json({ success: false, error: "SKU ID missing" })

    await connectDB()

    const sku = await Sku.findByIdAndUpdate(id, { isActive: !!value }, { new: true })

    return NextResponse.json({ success: true, sku })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
