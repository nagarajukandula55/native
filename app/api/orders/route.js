import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"



/* ⭐ ORDER ID GENERATOR */
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



/* ⭐ CREATE ORDER */
export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    // ⭐ basic validation
    if(
      !body.customerName ||
      !body.phone ||
      !body.address ||
      !body.pincode ||
      !body.items ||
      body.items.length === 0
    ){
      return NextResponse.json({
        success:false,
        msg:"Missing fields"
      })
    }

    // ⭐ calculate total safely
    const totalAmount = body.items.reduce(
      (sum,item)=>
        sum + (Number(item.price) * Number(item.quantity)),
      0
    )

    // ⭐ ensure unique orderId
    let orderId = generateOrderId()

    const exists = await Order.findOne({ orderId })
    if(exists){
      orderId = generateOrderId()
    }

    const order = await Order.create({

      orderId,

      customerName: body.customerName,
      phone: body.phone,
      email: body.email || "",

      address: body.address,
      pincode: body.pincode,

      items: body.items,
      totalAmount,

      status:"Order Placed"

    })

    return NextResponse.json({
      success:true,
      orderId: order.orderId
    })

  }
  catch(e){

    console.log("CREATE ORDER ERROR:",e)

    return NextResponse.json({
      success:false,
      msg:"Server error"
    })

  }

}



/* ⭐ ADMIN FETCH ORDERS */
export async function GET(){

  try{

    await connectDB()

    const orders = await Order
      .find()
      .sort({ createdAt:-1 })

    return NextResponse.json({
      success:true,
      orders
    })

  }
  catch(e){

    return NextResponse.json({
      success:false
    })

  }

}



/* ⭐ ADMIN UPDATE STATUS */
export async function PUT(req){

  try{

    await connectDB()

    const body = await req.json()

    if(!body.id || !body.status){
      return NextResponse.json({ success:false })
    }

    await Order.findByIdAndUpdate(
      body.id,
      { status: body.status },
      { new:true }
    )

    return NextResponse.json({ success:true })

  }
  catch(e){

    return NextResponse.json({ success:false })

  }

}
