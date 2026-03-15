import { connectDB } from "@/lib/db"
import Order from "@/models/Order"
import { NextResponse } from "next/server"

export async function GET(req){

  try{

    await connectDB()

    const { searchParams } = new URL(req.url)

    const id = searchParams.get("id")

    const order = await Order.findOne({
      orderId: id
    })

    if(!order){
      return NextResponse.json({
        success:false
      })
    }

    return NextResponse.json({
      success:true,
      order
    })

  }catch(e){

    return NextResponse.json({
      success:false
    })

  }

}
