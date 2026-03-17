export const dynamic = "force-dynamic"

import connectDB from "@/lib/db"
import Sku from "@/models/Sku"
import { NextResponse } from "next/server"

export async function GET(){
  await connectDB()

  const skus = await Sku.find()
    .populate("product", "name")
    .populate("warehouse", "name city code")
    .sort({ createdAt: -1 })

  return NextResponse.json({ success: true, skus })
}
