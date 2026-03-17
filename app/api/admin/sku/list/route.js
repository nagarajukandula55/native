import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import SKU from "@/models/SKU"

export async function GET(){

  await connectDB()

  const data = await SKU.find()
    .populate("productId","name")
    .sort({createdAt:-1})

  return NextResponse.json(data)
}
