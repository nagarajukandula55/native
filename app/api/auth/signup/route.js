import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ success: false, msg: "All fields are required" }), { status: 400 })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return new Response(JSON.stringify({ success: false, msg: "Email already registered" }), { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({ name, email, password: hashedPassword })

    return new Response(JSON.stringify({ success: true, msg: "User registered successfully" }), { status: 201 })

  } catch (err) {
    console.log(err)
    return new Response(JSON.stringify({ success: false, msg: "Server error" }), { status: 500 })
  }
}
