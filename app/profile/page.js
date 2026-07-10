"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getMe, isLoggedIn } from "@/lib/an-sdk/auth"
import { updateProfile, changePassword } from "@/lib/an-sdk/users"
import { getMyOrders } from "@/lib/an-sdk/orders"
import { ApiError } from "@/lib/an-sdk/client"
import { useWishlist } from "@/context/WishlistContext"
import { useCart } from "@/context/CartContext"
import RecentlyViewed from "@/components/RecentlyViewed"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tab, setTab] = useState("profile")

  const { wishlist, removeFromWishlist } = useWishlist() || {}
  const { addToCart } = useCart() || {}

  const [editForm, setEditForm] = useState({ name: "", phone: "" })
  const [editMsg, setEditMsg] = useState("")
  const [editSaving, setEditSaving] = useState(false)

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" })
  const [pwMsg, setPwMsg] = useState("")
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn()) {
        router.push("/login")
        return
      }

      try {
        const me = await getMe()

        if (!me) {
          setError("Failed to fetch profile")
        } else {
          setUser(me)
          setEditForm({ name: me.name || "", phone: me.phone || "" })
          // Best-effort — ANgroup has no dedicated customer-scoped order
          // history endpoint; getMyOrders() filters client-side. See
          // lib/an-sdk/orders.ts for details.
          getMyOrders()
            .then((data) => setOrders(data?.orders || []))
            .catch(() => setOrders([]))
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

  async function handleEditSubmit(e) {
    e.preventDefault()
    setEditMsg("")
    setEditSaving(true)
    try {
      const res = await updateProfile(user.id, {
        name: editForm.name,
        phone: editForm.phone,
      })
      if (res?.user) {
        setUser((u) => ({ ...u, name: res.user.name, phone: res.user.phone }))
      }
      setEditMsg("success:Profile updated")
    } catch (err) {
      setEditMsg(err instanceof ApiError ? err.message : "Could not update profile")
    } finally {
      setEditSaving(false)
    }
  }

  async function handlePwSubmit(e) {
    e.preventDefault()
    setPwMsg("")
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwMsg("Please fill both fields")
      return
    }
    setPwSaving(true)
    try {
      const res = await changePassword(pwForm.currentPassword, pwForm.newPassword)
      setPwMsg("success:" + (res?.message || "Password changed"))
      setPwForm({ currentPassword: "", newPassword: "" })
    } catch (err) {
      setPwMsg(err instanceof ApiError ? err.message : "Could not change password")
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading profile...</p>
  if (error) return <p style={{ textAlign: "center", marginTop: 50, color: "red" }}>{error}</p>
  if (!user) return null

  const editIsSuccess = editMsg.startsWith("success:")
  const pwIsSuccess = pwMsg.startsWith("success:")

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "orders", label: `Order History (${orders.length})` },
    { key: "wishlist", label: `Wishlist (${(wishlist || []).length})` },
    { key: "recent", label: "Recently Viewed" },
  ]

  return (
    <div style={{ maxWidth: 900, margin: "50px auto", padding: 20 }}>
      <h2>My Account</h2>
      <p style={{ color: "#666", marginTop: -6 }}>Hello, {user.name}</p>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 8, marginTop: 24, borderBottom: "1px solid #eee", flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: tab === t.key ? 700 : 400,
              borderBottom: tab === t.key ? "2px solid #c28b45" : "2px solid transparent",
              color: tab === t.key ? "#c28b45" : "#333",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <>
      {/* Account info */}
      <section style={{ marginTop: 30 }}>
        <h3>Account Info</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone || "Not set"}</p>
      </section>

      {/* Edit profile */}
      <section style={{ marginTop: 30, maxWidth: 420 }}>
        <h3>Edit Profile</h3>
        <form onSubmit={handleEditSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Name</label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Phone</label>
            <input
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
            />
          </div>
          {editMsg && (
            <p style={{ fontSize: 12, color: editIsSuccess ? "#16a34a" : "#e11d48" }}>
              {editIsSuccess ? editMsg.slice(8) : editMsg}
            </p>
          )}
          <button
            disabled={editSaving}
            style={{
              padding: "10px 20px",
              background: "#c28b45",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {editSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section style={{ marginTop: 30, maxWidth: 420 }}>
        <h3>Change Password</h3>
        <form onSubmit={handlePwSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Current Password</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>New Password</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
            />
          </div>
          {pwMsg && (
            <p style={{ fontSize: 12, color: pwIsSuccess ? "#16a34a" : "#e11d48" }}>
              {pwIsSuccess ? pwMsg.slice(8) : pwMsg}
            </p>
          )}
          <button
            disabled={pwSaving}
            style={{
              padding: "10px 20px",
              background: "#222",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {pwSaving ? "Saving..." : "Change Password"}
          </button>
        </form>
      </section>
        </>
      )}

      {/* ORDER HISTORY TAB */}
      {tab === "orders" && (
      <section style={{ marginTop: 30 }}>
        <h3>Your Orders</h3>
        {orders.length === 0 ? <p>No orders yet</p> : (
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
              {orders.map((o) => (
                <tr key={o._id || o.orderId} style={{ borderBottom: "1px solid #eee" }}>
                  <td>{o.orderId}</td>
                  <td>{o.status}</td>
                  <td>₹{o.totalAmount ?? o.amount ?? 0}</td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      )}

      {/* WISHLIST TAB */}
      {tab === "wishlist" && (
      <section style={{ marginTop: 30 }}>
        <h3>Your Wishlist</h3>
        {(!wishlist || wishlist.length === 0) ? (
          <p>Your wishlist is empty. <Link href="/products">Browse products</Link></p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {wishlist.map((item) => (
              <div key={item.productId} style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                <Link href={`/products/${item.slug}`}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                </Link>
                <div style={{ padding: 10 }}>
                  <h4 style={{ fontSize: 14, margin: "0 0 6px" }}>{item.name}</h4>
                  <p style={{ fontWeight: 700, color: "#c28b45", margin: "0 0 8px" }}>₹{item.price}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() =>
                        addToCart?.({
                          productId: item.productId,
                          productKey: item.productId,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          qty: 1,
                        })
                      }
                      style={{ flex: 1, padding: 8, border: "none", borderRadius: 6, background: "#222", color: "#fff", cursor: "pointer", fontSize: 12 }}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist?.(item.productId)}
                      style={{ padding: 8, border: "1px solid #d33", borderRadius: 6, background: "transparent", color: "#d33", cursor: "pointer", fontSize: 12 }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {/* RECENTLY VIEWED TAB */}
      {tab === "recent" && (
      <section style={{ marginTop: 30 }}>
        <RecentlyViewed title="Recently Viewed" />
      </section>
      )}
    </div>
  )
}
