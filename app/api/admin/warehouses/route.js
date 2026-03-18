// app/api/admin/warehouses/route.js
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Warehouse from "@/models/Warehouse"

const MONGODB_URI = process.env.MONGODB_URI

async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(MONGODB_URI)
}
// GET all warehouses
export async function GET() {
  try {
    await connectDB()
    const warehouses = await Warehouse.find().sort({ createdAt: -1 })
    return NextResponse.json(warehouses)
  } catch (error) {
    console.error("GET WAREHOUSES ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch warehouses" }, { status: 500 })
  }
}
