export const dynamic = "force-dynamic"

import connectDB from "@/lib/db"
import Inventory from "@/models/Inventory"
import { NextResponse } from "next/server"

export async function POST(req){

  try{

    await connectDB()

    const { skuId, warehouseId, qty } =
      await req.json()

    if(!skuId || !warehouseId || !qty){
      return NextResponse.json({
        success:false,
        message:"Missing fields"
      })
    }

    // ⭐ check if already stock exists
    let item = await Inventory.findOne({
      skuId,
      warehouseId
    })

    if(item){

      item.qty =
        Number(item.qty) + Number(qty)

      await item.save()

    }else{

      await Inventory.create({
        skuId,
        warehouseId,
        qty
      })

    }

    return NextResponse.json({
      success:true
    })

  }catch(err){

    console.log("INVENTORY ERROR:",err)

    return NextResponse.json({
      success:false,
      message: err.message
    })
  }
}
