import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(req){

  try{

    await connectDB()

    const { searchParams } = new URL(req.url)

    const id =
      searchParams.get("id") ||
      searchParams.get("orderId")

    if(!id){
      return NextResponse.json({ success:false })
    }

    const order = await Order.findOne({
      orderId: id.trim()
    })

    if(!order){
      return NextResponse.json({ success:false })
    }

    return NextResponse.json({
      success:true,
      order
    })

  }catch(e){

    console.log("TRACK ERROR",e)

    return NextResponse.json({ success:false })

  }

}
