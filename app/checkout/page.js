"use client";

import { useCart } from "../context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });

  if (cart.length === 0) {
    return (
      <div style={{ padding: "80px 60px" }}>
        <h2>Your cart is empty.</h2>
        <button
          onClick={() => router.push("/")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#c28b45",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Go to Products
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: formData,
          items: cart,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Order Created Successfully! Order ID: ${data.orderId}`);
        clearCart();
        router.push("/");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      alert("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "80px 60px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "40px", marginBottom: "40px" }}>
        Checkout
      </h1>

      <div style={{ display: "flex", gap: "60px", flexWrap: "wrap" }}>
        {/* Customer Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: "1",
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <input name="name" placeholder="Full Name" required onChange={handleChange} />
          <input name="phone" placeholder="Phone Number" required onChange={handleChange} />
          <textarea name="address" placeholder="Full Address" required onChange={handleChange} />
          <input name="pincode" placeholder="Pincode" required onChange={handleChange} />
          <input name="city" placeholder="City" required onChange={handleChange} />
          <input name="state" placeholder="State" required onChange={handleChange} />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: "25px",
              border: "none",
              backgroundColor: "#c28b45",
              color: "#fff",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        {/* Order Summary */}
        <div
          style={{
            flex: "1",
            minWidth: "300px",
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Order Summary</h3>

          {cart.map((item) => (
            <div key={item.id} style={{ marginBottom: "10px" }}>
              <p>
                {item.name} × {item.quantity}
              </p>
              <p>₹{item.price * item.quantity}</p>
            </div>
          ))}

          <hr />

          <h3>Total: ₹{cartTotal}</h3>
        </div>
      </div>
    </div>
  );
}
