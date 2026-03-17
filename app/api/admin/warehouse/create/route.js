export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Warehouse from "@/models/Warehouse"

export async function POST(req) {
  try {

    await connectDB()

    const body = await req.json()

    const warehouse = await Warehouse.create({
      warehouseCode: body.warehouseCode,
      warehouseName: body.warehouseName,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      address: body.address
    })

    return NextResponse.json({
      success: true,
      data: warehouse
    })

  } catch (err) {

    return NextResponse.json({
      success: false,
      message: err.message
    })
  }
}
