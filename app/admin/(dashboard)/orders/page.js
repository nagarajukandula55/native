"use client"

import { useEffect, useState } from "react"

export default function AdminOrders(){

  const [orders,setOrders] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    loadOrders()
  },[])

  async function loadOrders(){

    try{

      const res = await fetch("/api/orders")
      const data = await res.json()

      if(data.success){
        setOrders(data.orders.reverse())
      }

    }catch(err){
      alert("Failed to load orders")
    }

    setLoading(false)
  }

  async function updateStatus(id,status){

    const res = await fetch("/api/orders",{
      method:"PUT",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        orderId:id,
        status
      })
    })

    const data = await res.json()

    if(data.success){
      alert("✅ Status Updated")
      loadOrders()
    }else{
      alert("❌ Failed to update")
    }

  }

  if(loading){
    return <h2 style={{padding:"40px"}}>Loading Orders...</h2>
  }

  return(

    <div>

      <h1 style={{marginBottom:"20px"}}>📦 Orders Dashboard</h1>

      {orders.length === 0 && (
        <p>No orders yet</p>
      )}

      {orders.map(order => (

        <div key={order._id}
          style={{
            background:"#fff",
            padding:"25px",
            marginBottom:"20px",
            borderRadius:"10px",
            boxShadow:"0 2px 8px rgba(0,0,0,0.08)"
          }}
        >

          <h3 style={{marginBottom:"10px"}}>
            Order ID: {order.orderId}
          </h3>

          <p><b>Customer:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.phone}</p>
          <p><b>Email:</b> {order.email}</p>
          <p><b>Address:</b> {order.address} - {order.pincode}</p>

          <p style={{marginTop:"10px"}}>
            <b>Total:</b> ₹ {order.totalAmount}
          </p>

          <p>
            <b>Status:</b> 
            <span style={{
              marginLeft:"8px",
              padding:"4px 10px",
              background:"#eee",
              borderRadius:"6px"
            }}>
              {order.status}
            </span>
          </p>

          <p>
            <b>Date:</b> {new Date(order.createdAt).toLocaleString()}
          </p>

          <h4 style={{marginTop:"15px"}}>Items:</h4>

          {order.items.map((item,i)=>(
            <p key={i}>
              {item.name} — {item.quantity} × ₹{item.price}
            </p>
          ))}

          {/* ⭐ STATUS ACTIONS */}

          <div style={{
            marginTop:"15px",
            display:"flex",
            gap:"10px",
            flexWrap:"wrap"
          }}>

            <button style={btnYellow}
              onClick={()=>updateStatus(order._id,"Packed")}
            >
              📦 Packed
            </button>

            <button style={btnBlue}
              onClick={()=>updateStatus(order._id,"Shipped")}
            >
              🚚 Shipped
            </button>

            <button style={btnGreen}
              onClick={()=>updateStatus(order._id,"Delivered")}
            >
              ✅ Delivered
            </button>

          </div>

        </div>

      ))}

    </div>

  )

}

const btnYellow = {
  padding:"8px 14px",
  border:"none",
  background:"#f4b400",
  color:"#fff",
  cursor:"pointer",
  borderRadius:"6px"
}

const btnBlue = {
  padding:"8px 14px",
  border:"none",
  background:"#4285f4",
  color:"#fff",
  cursor:"pointer",
  borderRadius:"6px"
}

const btnGreen = {
  padding:"8px 14px",
  border:"none",
  background:"#0f9d58",
  color:"#fff",
  cursor:"pointer",
  borderRadius:"6px"
}
