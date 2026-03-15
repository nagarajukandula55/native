"use client"

import { useState } from "react"

export default function TrackPage(){

  const [orderId,setOrderId] = useState("")
  const [order,setOrder] = useState(null)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  async function trackOrder(){

    if(!orderId){
      alert("Enter Order ID")
      return
    }

    setLoading(true)
    setError("")
    setOrder(null)

    try{

      const res = await fetch(
        "/api/track?id=" + orderId.trim()
      )

      const data = await res.json()

      console.log("TRACK RESPONSE:",data)

      if(data.success){
        setOrder(data.order)
      }else{
        setError("Order not found")
      }

    }catch(e){
      setError("Server error")
    }

    setLoading(false)
  }

  return(

    <div style={{padding:"40px"}}>

      <h1>Track Your Order</h1>

      <input
        value={orderId}
        onChange={e=>setOrderId(e.target.value)}
        placeholder="Enter Order ID"
        style={{
          padding:"10px",
          width:"300px",
          marginRight:"10px"
        }}
      />

      <button onClick={trackOrder}>
        Track
      </button>

      {loading && <p>Checking...</p>}

      {error && <p style={{color:"red"}}>{error}</p>}

      {order && (

        <div style={{
          marginTop:"30px",
          padding:"20px",
          background:"#fff",
          borderRadius:"10px"
        }}>

          <h3>Order: {order.orderId}</h3>
          <p>Status: {order.status}</p>
          <p>Total: ₹ {order.totalAmount}</p>

        </div>

      )}

    </div>
  )

}
