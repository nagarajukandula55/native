import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"

export async function GET(req) {
  try {
    await connectDB()
    const authHeader = req.headers.get("authorization")
    if (!authHeader) return new Response(JSON.stringify({ success: false, msg: "Unauthorized" }), { status: 401 })

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
      .populate("favourites")
      .populate({
        path: "orders",
        options: { sort: { createdAt: -1 } }
      })

    if (!user) return new Response(JSON.stringify({ success: false, msg: "User not found" }), { status: 404 })

    return new Response(JSON.stringify({ success: true, user }), { status: 200 })
  } catch (err) {
    console.log(err)
    return new Response(JSON.stringify({ success: false, msg: "Server error" }), { status: 500 })
  }
}
