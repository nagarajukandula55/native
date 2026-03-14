import { NextResponse } from "next/server"
import connectToDB from "@/lib/mongodb"
import Product from "@/models/Product"

// ==========================
// ⭐ GET SINGLE PRODUCT
// ==========================
export async function GET(req,{ params }){

  try{

    await connectToDB()

    const product = await Product.findOne({ slug: params.slug }).lean()

    if(!product){
      return NextResponse.json({
        success:false,
        message:"Product not found"
      })
    }

    return NextResponse.json({
      success:true,
      product
    })

  }catch(err){

    return NextResponse.json({
      success:false,
      message:"Failed to fetch product"
    })

  }

}

// ==========================
// ⭐ UPDATE PRODUCT
// ==========================
export async function PUT(req,{ params }){

  try{

    await connectToDB()

    const body = await req.json()

    const updated = await Product.findOneAndUpdate(
      { slug: params.slug },
      body,
      { new:true }
    )

    return NextResponse.json({
      success:true,
      product: updated
    })

  }catch(err){

    return NextResponse.json({
      success:false,
      message:"Update failed"
    })

  }

}

// ==========================
// ⭐ DELETE PRODUCT
// ==========================
export async function DELETE(req,{ params }){

  try{

    await connectToDB()

    await Product.findOneAndDelete({ slug: params.slug })

    return NextResponse.json({
      success:true
    })

  }catch(err){

    return NextResponse.json({
      success:false,
      message:"Delete failed"
    })

  }

}
