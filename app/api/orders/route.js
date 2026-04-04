export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Warehouse from "@/models/Warehouse"
import { reserveStock, releaseStock } from "@/lib/inventory"

/* ================= ORDER ID ================= */
function generateOrderId() {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `NAT-${yy}${mm}${dd}-${rand}`
}

/* ================= CREATE ORDER ================= */
export async function POST(req) {
  await connectDB()

  let reserved = false
  let warehouse = null

  try {
    const body = await req.json()

    /* ================= VALIDATION ================= */
    if (
      !body.customerName ||
      !body.phone ||
      !body.address ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    /* ================= GET WAREHOUSE ================= */
    warehouse = await Warehouse.findOne({ status: "ACTIVE" }).sort({ priority: 1 })

    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "No active warehouse available" },
        { status: 400 }
      )
    }

    /* ================= PREPARE ITEMS ================= */
    const items = body.items.map(i => ({
      productId: i.productId,
      quantity: Number(i.quantity),
      price: Number(i.price),
      name: i.name,
    }))

    /* ================= RESERVE STOCK ================= */
    await reserveStock(items, warehouse._id)
    reserved = true

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      orderId: generateOrderId(),

      customerName: body.customerName,
      phone: body.phone,
      email: body.email || "",

      address: body.address,
      pincode: body.pincode,

      items: items.map(i => ({
        product: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),

      totalAmount: items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      ),

      warehouse: warehouse._id,

      status: "PLACED",

      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "PENDING",

      statusHistory: [
        {
          status: "PLACED",
          updatedAt: new Date(),
        },
      ],
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        _id: order._id,
      },
    })

  } catch (error) {
    console.error("ORDER ERROR:", error)

    /* ================= ROLLBACK ================= */
    if (reserved && warehouse) {
      try {
        const body = await req.json()
        await releaseStock(body.items, warehouse._id)
      } catch (e) {
        console.error("Rollback failed:", e)
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 }
    )
  }
}
