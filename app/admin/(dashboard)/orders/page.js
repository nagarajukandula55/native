"use client"

import { useEffect, useState } from "react"

export default function AdminOrders(){

  const [orders,setOrders] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    async function fetchOrders(){

      try{

        const res = await fetch("/api/orders")
        const data = await res.json()

        if(data.success){
          setOrders(data.orders)
        }

      }catch(err){
        alert("Failed to load orders")
      }

      setLoading(false)

    }

    fetchOrders()

  },[])

  if(loading){
    return <h2 style={{padding:"40px"}}>Loading Orders...</h2>
  }

  return(

    <div style={{padding:"40px"}}>

      <h1>📦 Orders Dashboard</h1>

      {orders.length === 0 && (
        <p>No orders yet</p>
      )}

      {orders.map(order => (

        <div key={order._id}
          style={{
            border:"1px solid #ddd",
            padding:"20px",
            marginTop:"20px",
            borderRadius:"8px"
          }}
        >

          <h3>Order ID: {order.orderId}</h3>

          <p><b>Name:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.phone}</p>
          <p><b>Email:</b> {order.email}</p>
          <p><b>Address:</b> {order.address}</p>
          <p><b>Pincode:</b> {order.pincode}</p>

          <p><b>Total:</b> ₹ {order.totalAmount}</p>

          <p><b>Status:</b> {order.status}</p>

          <p><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>

          <h4>Items:</h4>

          {order.items.map((item,i)=>(
            <p key={i}>
              {item.name} — {item.quantity} × ₹{item.price}
            </p>
          ))}

        </div>

      ))}

    </div>

  )

}
