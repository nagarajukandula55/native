import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"



/* ⭐ TELEGRAM FUNCTION (ADDED) */
async function sendTelegramMessage(text){

  try{

    const token = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if(!token || !chatId){
      console.log("Telegram ENV missing")
      return
    }

    await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text
        })
      }
    )

  }catch(e){
    console.log("Telegram Error:",e)
  }

}



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

    const totalAmount = body.items.reduce(
      (sum,item)=>
        sum + (Number(item.price) * Number(item.quantity)),
      0
    )

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


    /* ⭐⭐ TELEGRAM TRIGGER ADDED */
    await sendTelegramMessage(
`🛒 NEW ORDER RECEIVED

Order ID: ${order.orderId}
Customer: ${order.customerName}
Phone: ${order.phone}
Amount: ₹${order.totalAmount}
Status: ${order.status}`
    )


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
