export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Warehouse from "@/models/Warehouse"

export async function GET(){

  try{

    await connectDB()

    const data = await Warehouse.find().sort({createdAt:-1})

    return NextResponse.json({
      success:true,
      warehouses:data
    })

  }catch(err){

    return NextResponse.json({
      success:false,
      warehouses:[]
    })
  }

}
