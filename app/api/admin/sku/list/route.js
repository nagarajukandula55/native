export const dynamic = "force-dynamic"

import connectDB from "@/lib/db"
import SKU from "@/models/SKU"
import { NextResponse } from "next/server"

export async function GET() {

  await connectDB()

  const skus = await SKU.find()
    .populate("productId", "name")

  return NextResponse.json(skus)
}
