export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Warehouse from "@/models/Warehouse"

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    const wh = await Warehouse.create(body)

    return NextResponse.json({
      success:true,
      warehouse: wh
    })

  }catch(err){

    return NextResponse.json({
      success:false,
      message: err.message
    })
  }

}
