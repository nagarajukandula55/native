import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(req){

  try{

    await connectDB()

    const { searchParams } = new URL(req.url)

    let id = searchParams.get("id")

    if(!id){
      return NextResponse.json({ success:false })
    }

    id = id.trim()

    const order = await Order.findOne({
      orderId: { $regex: "^"+id+"$", $options:"i" }
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
