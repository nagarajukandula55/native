"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()

        if (!data.success) {
          setError(data.msg)
        } else {
          setUser(data.user)
        }
      } catch (err) {
        console.log(err)
        setError("Failed to fetch profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading profile...</p>
  if (error) return <p style={{ textAlign: "center", marginTop: 50, color: "red" }}>{error}</p>
  if (!user) return null

  return (
    <div style={{ maxWidth: 900, margin: "50px auto", padding: 20 }}>
      <h2>Hello, {user.name}</h2>
      {/* Orders */}
      <section style={{ marginTop: 30 }}>
        <h3>Your Orders</h3>
        {user.orders?.length === 0 ? <p>No orders yet</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc" }}>
                <th>Order ID</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {user.orders.map((o) => (
                <tr key={o._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{o.orderId}</td>
                  <td>{o.status}</td>
                  <td>₹{o.totalAmount}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Favourites */}
      <section style={{ marginTop: 30 }}>
        <h3>Your Favourites</h3>
        {user.favourites?.length === 0 ? <p>No favourites yet</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 20 }}>
            {user.favourites.map((f) => (
              <div key={f._id} style={{ border: "1px solid #eee", padding: 10, borderRadius: 8, textAlign: "center" }}>
                <img src={f.image} alt={f.name} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6 }} />
                <p style={{ marginTop: 10 }}>{f.name}</p>
                <p style={{ color: "#c28b45" }}>₹{f.price}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
