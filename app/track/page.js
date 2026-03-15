import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(req){

  await connectDB()

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  const allOrders = await Order.find().select("orderId")

  console.log("TRACK SEARCH:", id)
  console.log("ALL ORDERS:", allOrders)

  const order = await Order.findOne({ orderId:id })

  return NextResponse.json({
    searching:id,
    totalOrders: allOrders.length,
    dbOrders: allOrders,
    found: order ? true : false
  })
}
