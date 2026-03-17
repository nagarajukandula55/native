export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import SKU from "@/models/SKU"

export async function POST(req){

  try{

    await connectDB()

    const body = await req.json()

    const sku = await SKU.create({
      productId: body.productId,
      skuCode: body.skuCode,
      partCode: body.partCode,
      price: body.price
    })

    return NextResponse.json({
      success:true,
      sku
    })

  }catch(err){

    console.log(err)

    return NextResponse.json({
      success:false,
      message:"SKU create error"
    })
  }

}
