import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

// ⭐ ORDER ID GENERATOR
function generateOrderId(){

  const now = new Date()

  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth()+1).padStart(2,"0")
  const dd = String(now.getDate()).padStart(2,"0")

  const random = Math.random()
    .toString(36)
    .substring(2,6)
    .toUpperCase()

  return `NAT-${yy}${mm}${dd}-${random}`
}

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    // ⭐ CALCULATE TOTAL SAFE
    const total = body.items.reduce(
      (sum,item)=> sum + item.price * item.quantity,
      0
    )

    const newOrder = await Order.create({

      orderId: generateOrderId(),

      customerName: body.customerName,
      phone: body.phone,
      email: body.email || "",
      address: body.address,
      pincode: body.pincode,

      items: body.items,

      totalAmount: total,

      status:"Order Placed"

    })

    return NextResponse.json({
      success:true,
      orderId:newOrder.orderId
    })

  }catch(err){

    console.log("ORDER CREATE ERROR → ",err)

    return NextResponse.json({
      success:false,
      message:"Server error"
    })

  }

}

// ⭐ ADMIN GET ALL ORDERS
export async function GET(){

  try{

    await connectDB()

    const orders = await Order.find()
      .sort({ createdAt:-1 })

    return NextResponse.json({
      success:true,
      orders
    })

  }catch(err){

    return NextResponse.json({
      success:false
    })

  }

}

// ⭐ UPDATE ORDER STATUS
export async function PUT(req){

  try{

    await connectDB()

    const body = await req.json()

    const updated = await Order.findByIdAndUpdate(
      body.id,
      { status: body.status },
      { new:true }
    )

    return NextResponse.json({
      success:true,
      order:updated
    })

  }catch(err){

    return NextResponse.json({
      success:false
    })

  }

}
