"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartDrawer({ open, setOpen }) {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal
  } = useCart();

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "100%",
        maxWidth: "400px",
        height: "100vh",
        background: "#fff",
        boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
        padding: "20px",
        zIndex: 2000,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
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
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <h2 style={{ marginBottom: "20px" }}>Your Cart</h2>

      {cart.length === 0 && <p>Your cart is empty</p>}

      <div style={{ flex: 1 }}>
        {cart.map((item) => (
          <div
            key={item.id} // use id from CartContext
            style={{
              borderBottom: "1px solid #eee",
              padding: "10px 0",
            }}
          >
            <h4>{item.name}</h4>
            <p>₹{item.price}</p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "5px",
              }}
            >
              <button
                onClick={() => decreaseQuantity(item.id)}
                style={{ padding: "2px 6px", cursor: "pointer" }}
              >
                -
              </button>

              <span>{item.quantity}</span>

              <button
                onClick={() => increaseQuantity(item.id)}
                style={{ padding: "2px 6px", cursor: "pointer" }}
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
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Total: ₹{cartTotal}</h3>
          <Link href="/checkout">
            <button
              onClick={() => setOpen(false)}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "12px",
                border: "none",
                background: "#c28b45",
                color: "#fff",
                borderRadius: "6px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Checkout
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
