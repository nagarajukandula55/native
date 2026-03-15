import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

function generateOrderId(){

  const now = new Date()

  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth()+1).padStart(2,"0")
  const dd = String(now.getDate()).padStart(2,"0")

  const rand = Math.random()
    .toString(36)
    .substring(2,6)
    .toUpperCase()

  return `NAT-${yy}${mm}${dd}-${rand}`
}


// ✅ CREATE ORDER
export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    const total = body.items.reduce(
      (sum,i)=> sum + i.price * i.quantity,
      0
    )

    const order = await Order.create({

      orderId: generateOrderId(),

      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      pincode: body.pincode,

      items: body.items,
      totalAmount: total,

      status:"Order Placed"

    })

    return NextResponse.json({
      success:true,
      orderId:order.orderId
    })

  }catch(e){

    console.log("ORDER ERROR",e)

    return NextResponse.json({
      success:false
    })

  }

}


// ✅ ADMIN FETCH
export async function GET(){

  await connectDB()

  const orders = await Order.find()
    .sort({createdAt:-1})

  return NextResponse.json({
    success:true,
    orders
  })

}


// ✅ STATUS UPDATE
export async function PUT(req){

  await connectDB()

  const body = await req.json()

  await Order.findByIdAndUpdate(
    body.id,
    { status: body.status }
  )

  return NextResponse.json({ success:true })

}
