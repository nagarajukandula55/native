import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(req){

  try{

    await connectDB()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if(!id){
      return NextResponse.json({
        success:false,
        msg:"Order id missing"
      })
    }

    // ⭐ use RAW collection query (no model dependency)
    const db = mongoose.connection.db

    const order = await db
      .collection("orders")
      .findOne({ orderId: id })

    if(!order){
      return NextResponse.json({
        success:false,
        msg:"Order not found"
      })
    }

    return NextResponse.json({
      success:true,
      order
    })

  }
  catch(e){

    console.log("TRACK API CRASH:", e)

    return NextResponse.json({
      success:false,
      error: String(e)   // ⭐ VERY IMPORTANT for debugging
    })

  }

}
