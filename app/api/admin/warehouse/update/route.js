export const dynamic = "force-dynamic"

import connectDB from "@/lib/db"
import Warehouse from "@/models/Warehouse"
import { NextResponse } from "next/server"

export async function POST(req){

  await connectDB()

  const body = await req.json()

  await Warehouse.findByIdAndUpdate(body._id,body)

  return NextResponse.json({ success:true })
}
