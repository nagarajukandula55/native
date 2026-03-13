import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Admin from "@/models/Admin"
import bcrypt from "bcryptjs"

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    const hashed = await bcrypt.hash(body.password,10)

    const admin = await Admin.create({
      name:body.name,
      email:body.email,
      password:hashed
    })

    return NextResponse.json({
      success:true
    })

  }catch(err){

    return NextResponse.json({
      success:false,
      message:"Admin creation failed"
    })

  }

}
