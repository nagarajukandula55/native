import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(){

  await connectDB()

  const orders = await Order.find().select("orderId")

  return NextResponse.json({
    count: orders.length,
    orders
  })

}
