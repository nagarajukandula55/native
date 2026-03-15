import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(req){

  await connectDB()

  const dbName = mongoose.connection.db.databaseName

  const collections =
    await mongoose.connection.db.listCollections().toArray()

  const orders = await Order.find().select("orderId")

  return NextResponse.json({
    db: dbName,
    collections,
    totalOrders: orders.length,
    sample: orders.slice(0,5)
  })

}
