export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Warehouse from "@/models/Warehouse"

export async function POST(req){

  await connectDB()

  const body = await req.json()

  await Warehouse.findByIdAndUpdate(
    body.id,
    { isActive: body.value }
  )

  return NextResponse.json({ success:true })
}
