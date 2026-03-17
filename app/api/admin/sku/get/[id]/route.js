export const dynamic = "force-dynamic"

import connectDB from "@/lib/db"
import Sku from "@/models/Sku"
import { NextResponse } from "next/server"

export async function GET(req,{ params }){
  await connectDB()
  const sku = await Sku.findById(params.id)
    .populate("product", "name")
    .populate("warehouse", "name city code")
  return NextResponse.json({ success: true, sku })
}
