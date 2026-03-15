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

  function getStepIndex(status){
    return steps.indexOf(status)
  }

  return(

    <div style={{padding:"40px",maxWidth:700,margin:"auto"}}>

      <h1 style={{marginBottom:"20px"}}>
        📦 Track Your Order
      </h1>

      <input
        placeholder="Enter Order ID"
        value={orderId}
        onChange={e=>setOrderId(e.target.value)}
        style={{
          padding:"10px",
          width:"100%",
          marginBottom:"10px"
        }}
      />

      <button
        onClick={trackOrder}
        style={{
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
          marginTop:"40px",
          background:"#fff",
          padding:"25px",
          borderRadius:"12px",
          boxShadow:"0 4px 14px rgba(0,0,0,0.08)"
        }}>

          <h3>Order ID: {order.orderId}</h3>
          <p>Customer: {order.customerName}</p>
          <p>Total: ₹ {order.totalAmount}</p>

          <div style={{marginTop:"30px"}}>

            {steps.map((step,i)=>{

              const current = getStepIndex(order.status)

              let color = "#ccc"

              if(i < current) color = "green"
              if(i === current) color = "#111"

              return(

                <div key={i}
                  style={{
                    display:"flex",
                    alignItems:"center",
                    marginBottom:"15px"
                  }}
                >

                  <div style={{
                    width:20,
                    height:20,
                    borderRadius:"50%",
                    background:color,
                    marginRight:"15px"
                  }} />

                  <div style={{
                    fontWeight: i === current ? "bold":"normal"
                  }}>
                    {step}
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
