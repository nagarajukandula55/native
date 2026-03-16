"use client"

import { useCart } from "@/context/CartContext"
import Link from "next/link"

export default function CartDrawer({ open, setOpen }) {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal
  } = useCart()

  if (!open) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "100%",
        maxWidth: "400px", // responsive width
        height: "100vh",
        background: "#fff",
        boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
        zIndex: 2000,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        padding: "20px"
      }}
    >
      {/* CLOSE BUTTON */}
      <button
        onClick={() => setOpen(false)}
        style={{
          position: "absolute",
          right: "15px",
          top: "10px",
          border: "none",
          background: "none",
          fontSize: "24px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        ✕
      </button>

      <h2 style={{ marginBottom: "20px", fontSize: "22px" }}>Your Cart</h2>

      {cart.length === 0 ? (
        <p style={{ marginTop: "20px" }}>Your cart is empty</p>
      ) : (
        <>
          <div style={{ flex: 1 }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "10px 0",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h4 style={{ margin: 0 }}>{item.name}</h4>
                  <p style={{ margin: 0 }}>₹{item.price}</p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "5px"
                  }}
                >
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      cursor: "pointer"
                    }}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      cursor: "pointer"
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    marginTop: "5px",
                    background: "none",
                    border: "none",
                    color: "red",
                    cursor: "pointer",
                    alignSelf: "flex-start"
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* TOTAL & CHECKOUT */}
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ marginBottom: "10px" }}>Total: ₹{cartTotal}</h3>

            <Link href="/checkout" onClick={() => setOpen(false)}>
              <button
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  background: "#c28b45",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "16px",
                  cursor: "pointer"
                }}
              >
                Checkout
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
