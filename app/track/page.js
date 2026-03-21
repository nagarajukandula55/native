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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const stepIndex = status => {
    const index = steps.indexOf(status)
    return index === -1 ? 0 : index
  }

  const getStepTime = status => {
    if (!order) return null
    const entry = order.statusHistory?.find(e => e.status === status)
    return entry ? new Date(entry.time).toLocaleString() : null
  }

  const getStepETA = i => {
    if (!order) return null
    const orderDate = new Date(order.createdAt)
    const eta = new Date(orderDate)

    const days = [0, 1, 2, 4, 5]
    eta.setDate(eta.getDate() + (days[i] || 0))

    return eta.toLocaleDateString()
  }

  const trackOrder = async () => {
    if (!orderId) return alert("Enter Order ID")

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
      console.error(e)
      alert("Server error")
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>📦 Track Order</h1>

      <input
        placeholder="Enter Order ID"
        value={orderId}
        onChange={e => setOrderId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && trackOrder()}
        style={input}
      />

      <button onClick={trackOrder} style={btn}>
        {loading ? "Tracking..." : "Track"}
      </button>

      {order && (
        <div style={card}>
          <h3>Order ID: {order.orderId}</h3>

          <p><b>Name:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.phone}</p>
          <p><b>Address:</b> {order.address} - {order.pincode}</p>
          <p><b>Total:</b> ₹ {order.totalAmount}</p>

          {/* ✅ PAYMENT STATUS */}
          <p>
            <b>Payment:</b>{" "}
            <span style={{
              color: order.paymentStatus === "Paid" ? "green" : "orange",
              fontWeight: "bold"
            }}>
              {order.paymentStatus}
            </span>
          </p>

          {/* ✅ COURIER DETAILS */}
          {order.awb && (
            <div style={{ marginTop: 10 }}>
              <p><b>Courier:</b> {order.courierName || "-"}</p>
              <p><b>AWB:</b> {order.awb}</p>

              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" style={trackBtn}>
                  🚚 Track Shipment
                </a>
              )}
            </div>
          )}

          <h4 style={{ marginTop: 20 }}>Items</h4>
          {order.items?.map((item, i) => (
            <p key={i}>{item.name} — {item.quantity} × ₹{item.price}</p>
          ))}

          {/* TIMELINE */}
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            marginTop: 30
          }}>
            {steps.map((s, i) => {
              const current = stepIndex(order.status)
              const completed = i < current
              const isCurrent = i === current

              return (
                <div key={i} style={{
                  flex: 1,
                  textAlign: isMobile ? "left" : "center",
                  marginBottom: isMobile ? 20 : 0
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: completed || isCurrent ? "#000" : "#ccc",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "auto"
                  }}>
                    {completed ? "✓" : ""}
                  </div>

                  <div style={{
                    fontWeight: isCurrent ? "bold" : "normal",
                    marginTop: 5
                  }}>
                    {s}
                  </div>

                  <div style={{ fontSize: 12, color: "#666" }}>
                    {getStepTime(s) || `ETA: ${getStepETA(i)}`}
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

/* ===== STYLES ===== */
const input = { width: "100%", padding: 10, marginTop: 10 }
const btn = { width: "100%", padding: 10, marginTop: 10, background: "#000", color: "#fff" }
const card = { marginTop: 30, padding: 20, background: "#fff", borderRadius: 10 }
const trackBtn = {
  display: "inline-block",
  marginTop: 10,
  padding: "8px 14px",
  background: "#16a34a",
  color: "#fff",
  textDecoration: "none",
  borderRadius: 6
}
