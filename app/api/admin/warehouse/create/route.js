export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Warehouse from "@/models/Warehouse"

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    console.log("BODY RECEIVED → ", body)

    const wh = await Warehouse.create({
      name: body.name,
      location: body.location
    })

    console.log("WAREHOUSE SAVED → ", wh)

    return NextResponse.json({
      success:true,
      warehouse: wh
    })

  }catch(err){

    console.log("❌ WAREHOUSE CREATE ERROR FULL → ", err)

    return NextResponse.json({
      success:false,
      message: err.message
    })
  }

}
