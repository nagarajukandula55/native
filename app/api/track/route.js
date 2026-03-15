import { connectDB } from "@/lib/db"
import Order from "@/models/Order"
import { NextResponse } from "next/server"

export async function GET(req){

  try{

    await connectDB()

    const { searchParams } = new URL(req.url)

    let id = searchParams.get("id")

    if(!id){
      return NextResponse.json({ success:false })
    }

    // ⭐ normalize
    id = id.trim()

    // ⭐ case-insensitive search
    const order = await Order.findOne({
      orderId: { $regex: "^" + id + "$", $options: "i" }
    })

    if(!order){
      return NextResponse.json({ success:false })
    }

    return NextResponse.json({
      success:true,
      order
    })

  }catch(e){

    return NextResponse.json({ success:false })

  }

}
