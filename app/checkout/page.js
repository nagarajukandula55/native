"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"

export default function CheckoutPage(){

  const router = useRouter()

  const { cart, closeCart, removeFromCart } = useCart()

  const [name,setName] = useState("")
  const [phone,setPhone] = useState("")
  const [email,setEmail] = useState("")
  const [address,setAddress] = useState("")
  const [pincode,setPincode] = useState("")
  const [loading,setLoading] = useState(false)

  const total = cart.reduce(
    (sum,item)=> sum + item.price * item.quantity,
    0
  )

  async function placeOrder(){

    if(cart.length === 0){
      alert("Cart is empty")
      return
    }

    setLoading(true)

    try{

      const res = await fetch("/api/orders",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          customerName:name,
          phone,
          email,
          address,
          pincode,
          items: cart
        })
      })

      const data = await res.json()

      if(data.success){

        // ⭐ clear cart
        cart.forEach(item => removeFromCart(item._id))

        // ⭐ close drawer
        closeCart()

        // ⭐ redirect
        router.push(`/order-success?orderId=${data.orderId}`)

      }else{

        alert(data.message || "Order Failed")

      }

    }catch(err){

      alert("Server Error")

    }

    setLoading(false)

  }

  return(

    <div style={{
      maxWidth:"600px",
      margin:"40px auto",
      padding:"20px"
    }}>

      <h1>Checkout</h1>

      <input
        placeholder="Full Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e)=>setPhone(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        style={inputStyle}
      />

      <textarea
        placeholder="Full Address"
        value={address}
        onChange={(e)=>setAddress(e.target.value)}
        style={{...inputStyle,height:"80px"}}
      />

      <input
        placeholder="Pincode"
        value={pincode}
        onChange={(e)=>setPincode(e.target.value)}
        style={inputStyle}
      />

      <h2>Total ₹ {total}</h2>

      <button
        onClick={placeOrder}
        disabled={loading}
        style={{
          padding:"12px 20px",
          background:"green",
          color:"#fff",
          border:"none",
          cursor:"pointer",
          width:"100%"
        }}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>

    </div>

  )

}

const inputStyle = {
  width:"100%",
  padding:"10px",
  margin:"10px 0",
  border:"1px solid #ccc"
}
