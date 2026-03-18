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

// CREATE a new warehouse
export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()

    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: "Name and Location are required" },
        { status: 400 }
      )
    }

    // Generate warehouse code: first 3 letters of name + last 3 digits of timestamp
    const code = body.name.slice(0, 3).toUpperCase() + Date.now().toString().slice(-3)

    const warehouse = await Warehouse.create({ ...body, code })
    return NextResponse.json({ success: true, warehouse })
  } catch (error) {
    console.error("CREATE WAREHOUSE ERROR:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create warehouse" },
      { status: 500 }
    )
  }
}

// DELETE a warehouse by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB()
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Warehouse ID is required" }, { status: 400 })
    }

    await Warehouse.deleteOne({ _id: id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE WAREHOUSE ERROR:", error)
    return NextResponse.json({ error: "Failed to delete warehouse" }, { status: 500 })
  }
}
