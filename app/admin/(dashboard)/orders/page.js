"use client"

import { useEffect, useState } from "react"

export default function AdminOrders(){

  const [orders,setOrders] = useState([])
  const [loading,setLoading] = useState(true)
  const [updatingId,setUpdatingId] = useState(null)

  useEffect(()=>{
    loadOrders()
  },[])

  async function loadOrders(){

    try{

      const res = await fetch("/api/orders")
      const data = await res.json()

      if(data.success){

        // ⭐ latest first
        const sorted = data.orders.sort(
          (a,b)=> new Date(b.createdAt) - new Date(a.createdAt)
        )

        setOrders(sorted)
      }

    }catch(err){
      alert("Failed to load orders")
    }

    setLoading(false)
  }

  async function updateStatus(id,status){

    setUpdatingId(id)

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
      loadOrders()
    }else{
      alert("❌ Failed to update status")
    }

    setUpdatingId(null)
  }

  function getStatusStyle(status){

    if(status==="Packed") return badgeYellow
    if(status==="Shipped") return badgeBlue
    if(status==="Out For Delivery") return badgePurple
    if(status==="Delivered") return badgeGreen

    return badgeGray
  }

  if(loading){
    return <h2 style={{padding:"40px"}}>Loading Orders...</h2>
  }

  return(

    <div style={{
      maxWidth:1100,
      margin:"auto",
      padding:"30px"
    }}>

      <h1 style={{
        fontSize:"28px",
        marginBottom:"25px"
      }}>
        📦 Orders Dashboard
      </h1>

      {orders.length===0 && <p>No orders yet</p>}

      {orders.map(order=>{

        const status = order.status || "Order Placed"

        return(

          <div key={order._id}
            style={card}
          >

            <h3 style={{marginBottom:"8px"}}>
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
                ...getStatusStyle(status),
                marginLeft:"8px"
              }}>
                {status}
              </span>
            </p>

            <p>
              <b>Date:</b>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>

            <h4 style={{marginTop:"15px"}}>Items:</h4>

            {order.items?.map((item,i)=>(
              <p key={i}>
                {item.name} — {item.quantity} × ₹{item.price}
              </p>
            ))}

            {/* ⭐ ACTION BUTTONS */}

            <div style={btnWrap}>

              <button
                disabled={updatingId===order._id}
                style={btnYellow}
                onClick={()=>updateStatus(order._id,"Packed")}
              >
                📦 Packed
              </button>

              <button
                disabled={updatingId===order._id}
                style={btnBlue}
                onClick={()=>updateStatus(order._id,"Shipped")}
              >
                🚚 Shipped
              </button>

              <button
                disabled={updatingId===order._id}
                style={btnPurple}
                onClick={()=>updateStatus(order._id,"Out For Delivery")}
              >
                🛵 Out For Delivery
              </button>

              <button
                disabled={updatingId===order._id}
                style={btnGreen}
                onClick={()=>updateStatus(order._id,"Delivered")}
              >
                ✅ Delivered
              </button>

            </div>

          </div>

        )

      })}

    </div>

  )

}

/* ⭐ STYLES */

const card = {
  background:"#fff",
  padding:"25px",
  marginBottom:"20px",
  borderRadius:"12px",
  boxShadow:"0 4px 14px rgba(0,0,0,0.08)"
}

const btnWrap = {
  marginTop:"15px",
  display:"flex",
  gap:"10px",
  flexWrap:"wrap"
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

const btnPurple = {
  padding:"8px 14px",
  border:"none",
  background:"#8e24aa",
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

const badgeYellow = {
  padding:"4px 10px",
  background:"#f4b400",
  color:"#fff",
  borderRadius:"6px"
}

const badgeBlue = {
  padding:"4px 10px",
  background:"#4285f4",
  color:"#fff",
  borderRadius:"6px"
}

const badgePurple = {
  padding:"4px 10px",
  background:"#8e24aa",
  color:"#fff",
  borderRadius:"6px"
}

const badgeGreen = {
  padding:"4px 10px",
  background:"#0f9d58",
  color:"#fff",
  borderRadius:"6px"
}

const badgeGray = {
  padding:"4px 10px",
  background:"#777",
  color:"#fff",
  borderRadius:"6px"
}
