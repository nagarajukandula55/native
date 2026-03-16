import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, msg: "All fields are required" }), { status: 400 })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return new Response(JSON.stringify({ success: false, msg: "Invalid credentials" }), { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, msg: "Invalid credentials" }), { status: 401 })
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    return new Response(JSON.stringify({ success: true, token, msg: "Login successful" }), { status: 200 })

  } catch (err) {
    console.log(err)
    return new Response(JSON.stringify({ success: false, msg: "Server error" }), { status: 500 })
  }
}
