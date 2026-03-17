export const dynamic = "force-dynamic"

import connectDB from "@/lib/db"
import SKU from "@/models/SKU"
import { NextResponse } from "next/server"

export async function POST(req) {

  await connectDB()

  const body = await req.json()

  const sku = await SKU.create(body)

  return NextResponse.json({
    success: true,
    sku
  })
}
