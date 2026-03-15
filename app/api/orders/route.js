import { NextResponse } from "next/server"

export async function POST(){

  return NextResponse.json({
    success:true,
    msg:"Orders API working"
  })

}
