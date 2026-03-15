import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(req){

  try{

    await connectDB()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if(!id){
      return NextResponse.json({
        success:false,
        message:"Order id missing"
      })
    }

    const order = await Order.findOne({
      orderId:id
    })

    if(!order){
      return NextResponse.json({
        success:false,
        message:"Order not found"
      })
    }

    return NextResponse.json({
      success:true,
      order
    })

  }catch(e){

    console.log("TRACK ERROR",e)

    return NextResponse.json({
      success:false
    })

  }

}
