"use client"

import { useState } from "react"

export default function TrackOrder(){

  const [orderId,setOrderId] = useState("")
  const [order,setOrder] = useState(null)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")

  async function track(){

    if(!orderId){
      alert("Enter Order ID")
      return
    }

    setLoading(true)
    setError("")
    setOrder(null)

    try{

      const res = await fetch("/api/track?id="+orderId)

      const data = await res.json()

      console.log("TRACK RESPONSE:",data)

      if(data && (data.success || data.order)){
        setOrder(data.order || data)
      }else{
        setError("Order not found")
      }

    }catch(e){
      setError("Server error")
    }

    setLoading(false)
  }

  function stepDone(step){

    const status = order?.status || "Order Placed"

    const flow = [
      "Order Placed",
      "Packed",
      "Shipped",
      "Out For Delivery",
      "Delivered"
    ]

    return flow.indexOf(status) >= flow.indexOf(step)
  }

  return(

    <div style={{maxWidth:800,margin:"auto",padding:30}}>

      <h1 style={{fontSize:28,fontWeight:"bold"}}>
        📦 Track Order
      </h1>

      <div style={{marginTop:20,display:"flex",gap:10}}>
        <input
          value={orderId}
          onChange={(e)=>setOrderId(e.target.value)}
          placeholder="Enter Order ID"
          style={{flex:1,padding:12}}
        />

        <button
          onClick={track}
          style={{
            padding:"12px 20px",
            background:"black",
            color:"#fff",
            borderRadius:6
          }}
        >
          Track
        </button>
      </div>

      {loading && <p style={{marginTop:20}}>Checking...</p>}
      {error && <p style={{marginTop:20,color:"red"}}>{error}</p>}

      {order && (

        <div style={{
          marginTop:40,
          padding:25,
          border:"1px solid #eee",
          borderRadius:12
        }}>

          <h3>Order ID: {order.orderId}</h3>
          <p>Total: ₹{order.totalAmount}</p>

          <div style={{marginTop:30}}>

            <Step title="Order Placed" done={stepDone("Order Placed")} />
            <Step title="Packed" done={stepDone("Packed")} />
            <Step title="Shipped" done={stepDone("Shipped")} />
            <Step title="Out For Delivery" done={stepDone("Out For Delivery")} />
            <Step title="Delivered" done={stepDone("Delivered")} />

          </div>

        </div>

      )}

    </div>

  )

}

function Step({title,done}){

  return(

    <div style={{
      display:"flex",
      alignItems:"center",
      marginBottom:18
    }}>

      <div style={{
        width:22,
        height:22,
        borderRadius:"50%",
        background: done ? "green" : "#ccc",
        marginRight:12
      }} />

      <div style={{
        fontWeight: done ? "bold" : "normal"
      }}>
        {title}
      </div>

    </div>

  )

}
