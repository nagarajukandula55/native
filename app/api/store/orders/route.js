export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { shipStock, deliverStock } from "@/lib/inventory"

/* ================= VERIFY ================= */
function verify(req) {
  const token = req.cookies.get("token")?.value
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

/* ================= STATUS FLOW ================= */
const validFlow = {
  PLACED: "CONFIRMED",
  CONFIRMED: "PACKED",
  PACKED: "SHIPPED",
  SHIPPED: "DELIVERED",
}

/* ================= GET STORE ORDERS ================= */
export async function GET(req) {
  try {
    await connectDB()

    const user = verify(req)
    if (!user || user.role !== "STORE") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const warehouseId = user.warehouse

    const orders = await Order.find({
      warehouse: warehouseId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("warehouse", "name code")

    return NextResponse.json({
      success: true,
      data: orders,
    })

  } catch (e) {
    console.error("GET STORE ORDERS ERROR:", e)

    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    )
  }
}

/* ================= UPDATE ORDER ================= */
export async function PUT(req) {
  try {
    await connectDB()

    const user = verify(req)
    if (!user || user.role !== "STORE") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, status, awbNumber, courierName, trackingUrl } = body

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: "Order ID & status required" },
        { status: 400 }
      )
    }

    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      )
    }

    /* 🔒 STORE ACCESS CONTROL */
    if (order.warehouse.toString() !== user.warehouse) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    /* ❌ INVALID FLOW */
    if (validFlow[order.status] !== status) {
      return NextResponse.json({
        success: false,
        message: `Invalid flow: ${order.status} → ${status}`,
      })
    }

    /* ================= PREPARE ITEMS ================= */
    const items = order.items.map(i => ({
      productId: i.product,
      quantity: i.quantity,
    }))

    const warehouseId = new mongoose.Types.ObjectId(order.warehouse)

    /* ================= SHIPPED ================= */
    if (order.status === "PACKED" && status === "SHIPPED") {
      if (!awbNumber || !courierName) {
        return NextResponse.json({
          success: false,
          message: "AWB & Courier required",
        })
      }

      await shipStock(items, warehouseId)
    }

    /* ================= DELIVERED ================= */
    if (order.status === "SHIPPED" && status === "DELIVERED") {
      await deliverStock(items, warehouseId)
    }

    /* ================= UPDATE ORDER ================= */
    order.status = status

    order.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: user.id,
    })

    if (awbNumber !== undefined) order.awbNumber = awbNumber
    if (courierName !== undefined) order.courierName = courierName
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl

    await order.save()

    return NextResponse.json({
      success: true,
      message: "Order updated",
      data: order,
    })

  } catch (e) {
    console.error("STORE UPDATE ERROR:", e)

    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    )
  }
}
