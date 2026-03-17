export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Warehouse from "@/models/Warehouse"

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    const wh = await Warehouse.create({
      name: body.name,
      location: body.location
    })

    return NextResponse.json({
      success:true,
      warehouse: wh
    })

  }catch(err){

    console.log("WAREHOUSE CREATE ERROR",err)

    return NextResponse.json({
      success:false,
      message:"Warehouse create failed"
    })
  }

}
