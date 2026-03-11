import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"

export async function DELETE(req, { params }) {

  await connectDB()

  const { id } = params

  await Product.findByIdAndDelete(id)

  return NextResponse.json({ success: true })
}
