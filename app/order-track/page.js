"use client"

import { useState } from "react"

export default function TrackPage(){

  const [orderId,setOrderId] = useState("")
  const [order,setOrder] = useState(null)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  async function handleTrack(){

    if(!orderId){
      alert("Please enter Order ID")
      return
    }

    setLoading(true)
    setError("")
    setOrder(null)

    try{

      const res = await fetch(
        "/api/order-track?id=" + orderId.trim()
      )

      const data = await res.json()

      console.log("TRACK RESPONSE:",data)

      if(data.success){
        setOrder(data.order)
      }else{
        setError("❌ Order not found")
      }

    }catch(e){
      setError("⚠️ Server error")
    }

    setLoading(false)
  }

  return(

    <div style={{
      padding:"50px",
      maxWidth:"700px",
      margin:"auto"
    }}>

      <h1 style={{marginBottom:"20px"}}>
        📦 Track Your Order
      </h1>

      <div style={{display:"flex", gap:"10px"}}>

        <input
          value={orderId}
          onChange={e=>setOrderId(e.target.value)}
          placeholder="Enter Order ID (Example: NAT-260315-KLE8)"
          style={{
            padding:"12px",
            flex:1,
            border:"1px solid #ccc",
            borderRadius:"6px"
          }}
        />

        <button
          onClick={handleTrack}
          style={{
            padding:"12px 20px",
            background:"#000",
            color:"#fff",
            border:"none",
            borderRadius:"6px",
            cursor:"pointer"
          }}
        >
          Track
        </button>

      </div>

      {loading && (
        <p style={{marginTop:"20px"}}>
          Checking order…
        </p>
      )}

      {error && (
        <p style={{marginTop:"20px",color:"red"}}>
          {error}
        </p>
      )}

      {order && (

        <div style={{
          marginTop:"30px",
          padding:"25px",
          background:"#fff",
          borderRadius:"10px",
          boxShadow:"0 2px 10px rgba(0,0,0,0.08)"
        }}>

          <h3>Order ID: {order.orderId}</h3>

          <p>
            <b>Status:</b> {order.status}
          </p>

          <p>
            <b>Total:</b> ₹ {order.totalAmount}
          </p>

          <p>
            <b>Date:</b>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>

          <h4 style={{marginTop:"15px"}}>Items</h4>

          {order.items.map((item,i)=>(
            <p key={i}>
              {item.name} — {item.quantity} × ₹{item.price}
            </p>
          ))}

        </div>

      )}

    </div>

  )

}
