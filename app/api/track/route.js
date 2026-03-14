import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/models/Order"

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    const cleanPhone = body.phone.replace(/\D/g,"")   // remove +91 spaces

    const order = await Order.findOne({
      orderId: body.orderId.trim(),
      phone: { $regex: cleanPhone }   // flexible match
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

  }catch(err){

    return NextResponse.json({
      success:false,
      message:"Tracking failed"
    })

  }

}
