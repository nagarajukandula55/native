import connectDB from "@/lib/db"
import SKU from "@/models/SKU"
import { NextResponse } from "next/server"

export async function GET() {

  await connectDB()

  const data = await SKU.find()
    .populate("productId")
    .sort({ createdAt: -1 })

  return NextResponse.json({ data })
}
