import { connectDB } from "@/lib/db"
import Order from "@/models/Order"
import { NextResponse } from "next/server"

function generateOrderId(){

  const now = new Date()

  const y = now.getFullYear().toString().slice(-2)
  const m = String(now.getMonth()+1).padStart(2,"0")
  const d = String(now.getDate()).padStart(2,"0")

  const rand = Math.random().toString(36).substring(2,6).toUpperCase()

  return `NAT-${y}${m}${d}-${rand}`

}

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    const orderId = generateOrderId()

    const newOrder = await Order.create({

      orderId,   // ⭐ VERY IMPORTANT
      customer:{
        name: body.name,
        phone: body.phone,
        address: body.address,
        pincode: body.pincode
      },

      items: body.items,

      totalAmount: body.total,

      status: "Order Placed"

    })

    return NextResponse.json({
      success:true,
      orderId: newOrder.orderId
    })

  }catch(e){

    return NextResponse.json({
      success:false
    })

  }

}
