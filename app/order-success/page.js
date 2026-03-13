"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function OrderSuccess(){

  const params = useSearchParams()
  const orderId = params.get("orderId")

  return(

    <div style={{padding:"60px", textAlign:"center"}}>

      <h1>🎉 Order Placed Successfully</h1>

      <p style={{fontSize:"18px", marginTop:"20px"}}>
        Your Order ID is
      </p>

      <h2 style={{color:"green"}}>{orderId}</h2>

      <p style={{marginTop:"20px"}}>
        Thank you for shopping with Native ❤️
      </p>

      <Link href="/products">
        <button style={{
          marginTop:"30px",
          padding:"12px 25px",
          background:"#2c7a4b",
          color:"#fff",
          border:"none",
          cursor:"pointer"
        }}>
          Continue Shopping
        </button>
      </Link>

    </div>

  )

}
