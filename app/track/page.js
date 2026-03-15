"use client"

import { useState } from "react"

export default function TrackPage(){

  const [orderId,setOrderId] = useState("")
  const [order,setOrder] = useState(null)
  const [loading,setLoading] = useState(false)

  async function trackOrder(){

    if(!orderId) return

    setLoading(true)

    const res = await fetch(`/api/order-track?id=${orderId}`)
    const data = await res.json()

    if(data.success){
      setOrder(data.order)
    }else{
      alert("Order not found")
      setOrder(null)
    }

    setLoading(false)
  }

  const steps = [
    "Order Placed",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered"
  ]

  function stepIndex(status){
    return steps.indexOf(status)
  }

  return(

    <div style={{maxWidth:800,margin:"auto",padding:"40px"}}>

      <h1>📦 Track Order</h1>

      <input
        placeholder="Enter Order ID"
        value={orderId}
        onChange={e=>setOrderId(e.target.value)}
        style={{padding:10,width:"100%",marginTop:10}}
      />

      <button
        onClick={trackOrder}
        style={{
          marginTop:10,
          padding:"10px 20px",
          background:"#111",
          color:"#fff",
          border:"none",
          cursor:"pointer"
        }}
      >
        {loading ? "Tracking..." : "Track"}
      </button>


      {order && (

        <div style={{
          marginTop:40,
          background:"#fff",
          padding:25,
          borderRadius:12,
          boxShadow:"0 4px 14px rgba(0,0,0,0.1)"
        }}>

          <h3>Order ID: {order.orderId}</h3>
          <p><b>Name:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.phone}</p>

          <p>
            <b>Address:</b><br/>
            {order.address} - {order.pincode}
          </p>

          <p><b>Total:</b> ₹ {order.totalAmount}</p>

          <h4 style={{marginTop:20}}>Items</h4>

          {order.items?.map((item,i)=>(
            <p key={i}>
              {item.name} — {item.quantity} × ₹{item.price}
            </p>
          ))}


          {/* ⭐ TIMELINE */}

          <div style={{marginTop:30}}>

            {steps.map((s,i)=>{

              const current = stepIndex(order.status)

              let bg = "#ddd"

              if(i < current) bg = "green"
              if(i === current) bg = "#111"

              return(

                <div key={i}
                  style={{
                    display:"flex",
                    alignItems:"center",
                    marginBottom:15
                  }}
                >

                  <div style={{
                    width:18,
                    height:18,
                    borderRadius:"50%",
                    background:bg,
                    marginRight:12
                  }}/>

                  <div style={{
                    fontWeight: i === current ? "bold":"normal"
                  }}>
                    {s}
                  </div>

                </div>

              )

            })}

          </div>

        </div>

      )}

    </div>

  )

}
