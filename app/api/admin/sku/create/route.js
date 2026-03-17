export const dynamic = "force-dynamic"

import connectDB from "../../../../../lib/db"
import Sku from "../../../../../models/Sku"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()

    const sku = new Sku(body)
    await sku.save()

    return NextResponse.json({ success: true, sku })
  } catch (err) {
    console.error("SKU CREATE ERROR:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
