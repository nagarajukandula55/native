import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import { NextResponse } from "next/server"

export async function POST(req){

try{

await dbConnect()

const body = await req.json()

const order = await Order.create({
customer: body.customer,
items: body.items
})

return NextResponse.json({
success:true,
orderId: order._id
})

}catch(err){

return NextResponse.json({
success:false,
message:"Order failed"
},{ status:500 })

}

}
