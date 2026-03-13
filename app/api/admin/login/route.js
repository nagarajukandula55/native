import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Admin from "@/models/Admin"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    const admin = await Admin.findOne({ email:body.email })

    if(!admin){
      return NextResponse.json({ success:false, message:"Invalid Email" })
    }

    const match = await bcrypt.compare(body.password, admin.password)

    if(!match){
      return NextResponse.json({ success:false, message:"Invalid Password" })
    }

    // ⭐ create session cookie
    cookies().set("adminToken", admin._id.toString(), {
      httpOnly:true,
      path:"/"
    })

    return NextResponse.json({
      success:true
    })

  }catch(err){

    return NextResponse.json({
      success:false,
      message:"Login failed"
    })

  }

}
