"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!data.success) {
          router.push("/login")
          return
        }
        setUser(data.user)
      } catch (err) {
        console.log(err)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>
  if (error) return <p style={{ textAlign: "center", marginTop: "50px", color: "red" }}>{error}</p>

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Welcome, {user.name}</h2>

      {/* Favourites */}
      <section style={{ marginBottom: "40px" }}>
        <h3>Favourite Products</h3>
        {user.favourites.length === 0 ? (
          <p>No favourites yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "20px", marginTop: "20px" }}>
            {user.favourites.map((prod) => (
              <div key={prod._id} style={{ border: "1px solid #eee", borderRadius: "12px", padding: "15px", textAlign: "center" }}>
                <img src={prod.image} alt={prod.name} style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }} />
                <h4 style={{ margin: "10px 0" }}>{prod.name}</h4>
                <p style={{ color: "#c28b45", fontWeight: "500" }}>₹{prod.price}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders */}
      <section>
        <h3>My Orders</h3>
        {user.orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ background: "#f4efe6" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Order ID</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Total</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {user.orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{order.orderId}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>₹{order.totalAmount}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{order.status}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
