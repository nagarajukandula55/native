import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

// ⭐ ORDER ID GENERATOR
function generateOrderId(){

  const now = new Date()

  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth()+1).padStart(2,"0")
  const dd = String(now.getDate()).padStart(2,"0")

  const random = Math.random().toString(36).substring(2,6).toUpperCase()

  return `NAT-${yy}${mm}${dd}-${random}`
}

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    const orderId = generateOrderId()

    // ⭐ SAFE TOTAL
    const total = body.items.reduce(
      (sum,item)=> sum + (item.price || 0) * (item.quantity || 1),
      0
    )

    const order = await Order.create({

      orderId: orderId,   // ⭐ VERY IMPORTANT

      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      pincode: body.pincode,

      items: body.items,

      totalAmount: total

    })

    return NextResponse.json({
      success:true,
      orderId: order.orderId
    })

  }catch(err){

    console.log("ORDER ERROR → ", err)

    return NextResponse.json({
      success:false,
      message: err.message
    })

  }

}

export async function GET(){

  try{

    await connectDB()

    const orders = await Order.find().sort({ createdAt:-1 })

    return NextResponse.json({
      success:true,
      orders
    })

  }catch(err){

    return NextResponse.json({
      success:false,
      message:"Failed to fetch orders"
    })

  }

}
