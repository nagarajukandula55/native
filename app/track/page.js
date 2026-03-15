"use client"

import { useState, useEffect } from "react"

export default function TrackPage() {
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const steps = [
    "Order Placed",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered"
  ]

  // Detect mobile for responsive layout
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const stepIndex = status => steps.indexOf(status)

  const getStepTime = status => {
    if (!order) return null
    const history = order.statusHistory || []
    const entry = history.find(e => e.status === status)
    if (entry) return new Date(entry.time).toLocaleString()
    if (status === order.status) return new Date(order.createdAt).toLocaleString()
    return null
  }

  const getStepETA = i => {
    if (!order) return null
    const orderDate = new Date(order.createdAt)
    let eta = new Date(orderDate)

    switch (i) {
      case 0: return eta.toLocaleDateString()
      case 1: eta.setDate(eta.getDate() + 1); return eta.toLocaleDateString()
      case 2: eta.setDate(eta.getDate() + 2); return eta.toLocaleDateString()
      case 3: eta.setDate(eta.getDate() + 4); return eta.toLocaleDateString()
      case 4: eta.setDate(eta.getDate() + 5); return eta.toLocaleDateString()
      default: return null
    }
  }

  const trackOrder = async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/order-track?id=${orderId}`)
      const data = await res.json()
      if (data.success) setOrder(data.order)
      else { alert("Order not found"); setOrder(null) }
    } catch (e) { console.log(e); alert("Error fetching order") }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: "20px 10px" }}>
      <h1 style={{ textAlign: "center" }}>📦 Track Order</h1>

      <input
        placeholder="Enter Order ID"
        value={orderId}
        onChange={e => setOrderId(e.target.value)}
        style={{ padding: 10, width: "100%", marginTop: 10, borderRadius: 6, border: "1px solid #ccc" }}
      />

      <button
        onClick={trackOrder}
        style={{
          marginTop: 10,
          padding: "10px 20px",
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          width: "100%"
        }}
      >
        {loading ? "Tracking..." : "Track"}
      </button>

      {order && (
        <div style={{
          marginTop: 30,
          background: "#fff",
          padding: 25,
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <h3>Order ID: {order.orderId}</h3>
          <p><b>Name:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.phone}</p>
          <p><b>Address:</b><br />{order.address} - {order.pincode}</p>
          <p><b>Total:</b> ₹ {order.totalAmount}</p>

          <h4 style={{ marginTop: 20 }}>Items</h4>
          {order.items?.map((item, i) => (
            <p key={i}>{item.name} — {item.quantity} × ₹{item.price}</p>
          ))}

          {/* ⭐ RESPONSIVE & ANIMATED TIMELINE */}
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: isMobile ? "flex-start" : "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            marginTop: 30,
            position: "relative"
          }}>
            {steps.map((s, i) => {
              const current = stepIndex(order.status)
              const completed = i < current
              const isCurrent = i === current
              const time = getStepTime(s)
              const eta = getStepETA(i)

              return (
                <div key={i} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMobile ? "flex-start" : "center",
                  position: "relative",
                  flex: 1,
                  marginBottom: isMobile ? 50 : 0
                }}>
                  {/* Animated Connector */}
                  {i < steps.length - 1 && (
                    <div style={{
                      position: "absolute",
                      top: isMobile ? 18 : "50%",
                      left: isMobile ? 8 : "50%",
                      width: isMobile ? 2 : "100%",
                      height: isMobile ? 40 : 2,
                      background: i < current ? "green" : "#ddd",
                      transition: "background 0.5s ease",
                      zIndex: 0
                    }} />
                  )}

                  {/* Dot with animated checkmark */}
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: completed || isCurrent ? "#111" : "#ddd",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: 12,
                    transition: "all 0.3s ease",
                    marginBottom: 5
                  }}>
                    {completed ? "✓" : ""}
                  </div>

                  {/* Step label + ETA */}
                  <div style={{ textAlign: isMobile ? "left" : "center" }}>
                    <div style={{ fontWeight: isCurrent ? "bold" : "normal", fontSize: 14 }}>{s}</div>
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
