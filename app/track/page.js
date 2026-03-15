"use client"

import { useState } from "react"

export default function TrackPage() {
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const steps = [
    "Order Placed",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered"
  ]

  function stepIndex(status) {
    return steps.indexOf(status)
  }

  function getStepTime(status) {
    if (!order) return null
    const history = order.statusHistory || []
    const entry = history.find(e => e.status === status)
    if (entry) return new Date(entry.time).toLocaleString()
    if (status === order.status) return new Date(order.createdAt).toLocaleString()
    return null
  }

  function getStepETA(i) {
    if (!order) return null
    const orderDate = new Date(order.createdAt)
    let eta = new Date(orderDate)

    switch (i) {
      case 0: // Order Placed
        return eta.toLocaleDateString()
      case 1: // Packed
        eta.setDate(eta.getDate() + 1)
        return eta.toLocaleDateString()
      case 2: // Shipped
        eta.setDate(eta.getDate() + 2) // 1+1
        return eta.toLocaleDateString()
      case 3: // Out For Delivery
        eta.setDate(eta.getDate() + 4) // 1+1+2
        return eta.toLocaleDateString()
      case 4: // Delivered
        eta.setDate(eta.getDate() + 5) // 1+1+2+1
        return eta.toLocaleDateString()
      default:
        return null
    }
  }

  async function trackOrder() {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/order-track?id=${orderId}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.order)
      } else {
        alert("Order not found")
        setOrder(null)
      }
    } catch (e) {
      console.log(e)
      alert("Error fetching order")
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: "20px 10px" }}>
      <h1>📦 Track Order</h1>

      <input
        placeholder="Enter Order ID"
        value={orderId}
        onChange={e => setOrderId(e.target.value)}
        style={{ padding: 10, width: "100%", marginTop: 10 }}
      />

      <button
        onClick={trackOrder}
        style={{
          marginTop: 10,
          padding: "10px 20px",
          background: "#111",
          color: "#fff",
          border: "none",
          cursor: "pointer"
        }}
      >
        {loading ? "Tracking..." : "Track"}
      </button>

      {order && (
        <div style={{
          marginTop: 30,
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
        }}>
          <h3>Order ID: {order.orderId}</h3>
          <p><b>Name:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.phone}</p>
          <p><b>Address:</b><br />{order.address} - {order.pincode}</p>
          <p><b>Total:</b> ₹ {order.totalAmount}</p>

          <h4 style={{ marginTop: 20 }}>Items</h4>
          {order.items?.map((item, i) => (
            <p key={i}>
              {item.name} — {item.quantity} × ₹{item.price}
            </p>
          ))}

          {/* ⭐ TIMELINE */}
          <div style={{ marginTop: 30, position: "relative", paddingLeft: 24 }}>
            {steps.map((s, i) => {
              const current = stepIndex(order.status)
              const completed = i < current
              const isCurrent = i === current
              const time = getStepTime(s)
              const eta = getStepETA(i)

              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", position: "relative", marginBottom: 40 }}>
                  {/* Line connector */}
                  {i < steps.length - 1 && (
                    <div style={{
                      position: "absolute",
                      top: 18,
                      left: 8,
                      width: 2,
                      height: 40,
                      background: i < current ? "green" : "#ddd",
                      zIndex: 0
                    }} />
                  )}

                  {/* Dot */}
                  <div style={{
                    width: 20,
                    height: 20,
                    minWidth: 20,
                    minHeight: 20,
                    borderRadius: "50%",
                    background: completed || isCurrent ? "#111" : "#ddd",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    flexShrink: 0,
                    fontSize: 12
                  }}>
                    {completed ? "✓" : ""}
                  </div>

                  {/* Step label */}
                  <div style={{ marginLeft: 12, flex: 1 }}>
                    <div style={{ fontWeight: isCurrent ? "bold" : "normal" }}>{s}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {time ? time : `ETA: ${eta}`}
                    </div>
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
