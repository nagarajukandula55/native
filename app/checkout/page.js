"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart, cartTotal, setCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);

  /* ================= PAY NOW ================= */
  const handlePayment = async () => {
    try {
      setLoading(true);

      if (!name || !phone || !address) {
        alert("Fill all details");
        setLoading(false);
        return;
      }

      // 1️⃣ Create order on backend
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          amount: cartTotal,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Order failed");
        setLoading(false);
        return;
      }

      const order = data.order;

      // 2️⃣ Razorpay config
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Native Store",
        description: "Order Payment",
        order_id: order.id,

        handler: function (response) {
          console.log("PAYMENT SUCCESS", response);

          alert("Payment Successful 🎉");

          // clear cart
          setCart([]);
        },

        prefill: {
          name,
          contact: phone,
        },

        theme: {
          color: "#c28b45",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Payment error");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Checkout</h1>

      {/* ================= ADDRESS FORM ================= */}
      <div className="form">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="summary">
        <p>Items: {cart.length}</p>
        <h2>Total: ₹{cartTotal}</h2>
      </div>

      {/* ================= PAY BUTTON ================= */}
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {/* ================= RAZORPAY SCRIPT ================= */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: auto;
          padding: 30px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        input, textarea {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }

        .summary {
          margin: 20px 0;
        }

        button {
          width: 100%;
          padding: 12px;
          background: #c28b45;
          border: none;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
