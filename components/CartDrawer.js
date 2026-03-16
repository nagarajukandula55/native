"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartDrawer({ open, setOpen }) {
  const { cart, increaseQty, decreaseQty, removeFromCart, cartTotal } = useCart();

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
        zIndex: 2000,
        boxShadow: "-4px 0 20px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setOpen()}
        style={{
          position: "absolute",
          right: "15px",
          top: "15px",
          border: "none",
          background: "none",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 2100,
        }}
      >
        ✕
      </button>

      <h2 style={{ margin: "15px 20px", fontWeight: "600" }}>Your Cart</h2>

      {/* Scrollable Items */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 20px",
          marginBottom: "80px", // leave space for fixed checkout section
        }}
      >
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          cart.map((item) => (
            <div
              key={item._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
              }}
            >
              <div>
                <h4 style={{ fontWeight: "500" }}>{item.name}</h4>
                <p>₹{item.price}</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <button
                  onClick={() => decreaseQty(item._id)}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => increaseQty(item._id)}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item._id)}
                style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Fixed Bottom Section */}
      {cart.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            padding: "15px 20px",
            borderTop: "1px solid #eee",
            background: "#fff",
          }}
        >
          <h3 style={{ fontWeight: "600", fontSize: "18px", marginBottom: "10px" }}>
            Total: ₹{cartTotal}
          </h3>
          <Link href="/checkout">
            <button
              onClick={() => setOpen()}
              style={{
                width: "100%",
                padding: "12px",
                border: "none",
                borderRadius: "6px",
                background: "#c28b45",
                color: "#fff",
                fontWeight: "600",
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
