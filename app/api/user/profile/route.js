import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"

export async function GET(req) {
  try {
    await connectDB()

    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, msg: "Unauthorized" }), { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return new Response(JSON.stringify({ success: false, msg: "Token missing" }), { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return new Response(JSON.stringify({ success: false, msg: "Invalid token" }), { status: 401 })
    }

    const user = await User.findById(decoded.id)
      .populate({
        path: "favourites",
        select: "name price image" // only necessary fields
      })
      .populate({
        path: "orders",
        select: "orderId totalAmount status createdAt",
        options: { sort: { createdAt: -1 } }
      })

    if (!user) {
      return new Response(JSON.stringify({ success: false, msg: "User not found" }), { status: 404 })
    }

    // Convert mongoose document to plain object to avoid serialization errors
    const safeUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      favourites: user.favourites.map(f => ({
        _id: f._id.toString(),
        name: f.name,
        price: f.price,
        image: f.image
      })),
      orders: user.orders.map(o => ({
        _id: o._id.toString(),
        orderId: o.orderId,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt
      }))
    }

    return new Response(JSON.stringify({ success: true, user: safeUser }), { status: 200 })

  } catch (err) {
    console.log("PROFILE API ERROR:", err)
    return new Response(JSON.stringify({ success: false, msg: "Server error" }), { status: 500 })
  }
}
