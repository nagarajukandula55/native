export const dynamic = "force-dynamic"

import connectDB from "@/lib/db"
import Warehouse from "@/models/Warehouse"
import { NextResponse } from "next/server"

export async function GET(req,{ params }){

  await connectDB()

  const warehouse = await Warehouse.findById(params.id)

  return NextResponse.json({
    success:true,
    warehouse
  })
}
