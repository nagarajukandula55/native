"use client"

import { useState } from "react"

export default function TrackOrder(){

  const [orderId,setOrderId] = useState("")
  const [phone,setPhone] = useState("")
  const [order,setOrder] = useState(null)
  const [msg,setMsg] = useState("")

  async function track(){

    setMsg("Checking...")
    setOrder(null)

    const res = await fetch("/api/track",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ orderId, phone })
    })

    const data = await res.json()

    if(data.success){
      setOrder(data.order)
      setMsg("")
    }else{
      setMsg("Order not found")
    }

  }

  return(

    <div style={{
      maxWidth:"500px",
      margin:"80px auto",
      padding:"20px"
    }}>

      <h1>Track Your Order</h1>

      <input
        placeholder="Order ID"
        value={orderId}
        onChange={e=>setOrderId(e.target.value)}
        style={input}
      />

      <input
        placeholder="Phone Number"
        value={phone}
        onChange={e=>setPhone(e.target.value)}
        style={input}
      />

      <button onClick={track} style={btn}>
        Track Order
      </button>

      <p>{msg}</p>

      {order && (

        <div style={{
          marginTop:"20px",
          padding:"20px",
          border:"1px solid #ddd",
          borderRadius:"8px"
        }}>

          <h3>Status: {order.status}</h3>

          <p>Total: ₹ {order.totalAmount}</p>

          <p>Date:
            {new Date(order.createdAt).toLocaleString()}
          </p>

        </div>

      )}

    </div>
  )

}

const input = {
  width:"100%",
  padding:"10px",
  marginTop:"10px"
}

const btn = {
  marginTop:"15px",
  padding:"10px",
  width:"100%",
  background:"#111",
  color:"#fff",
  border:"none",
  cursor:"pointer"
}
