import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Warehouse from "@/models/Warehouse"

export async function GET(){

  await connectDB()

  const data = await Warehouse.find().sort({createdAt:-1})

  return NextResponse.json(data)
}
