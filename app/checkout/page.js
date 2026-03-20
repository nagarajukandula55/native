"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, closeCart, removeFromCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* ================= PAYMENT FLOW ================= */
  async function handlePayment() {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (!name || !phone || !address || !pincode) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      /* 1️⃣ CREATE ORDER IN DB */
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name,
          phone,
          email,
          address,
          pincode,
          items: cart,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Order creation failed");
        setLoading(false);
        return;
      }

      const orderId = orderData.orderId;
      const dbOrderId = orderData._id || orderData.dbId; // depends your API

      /* 2️⃣ CREATE RAZORPAY ORDER */
      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentData.success) {
        alert("Payment initiation failed");
        setLoading(false);
        return;
      }

      /* 3️⃣ OPEN RAZORPAY */
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: paymentData.order.amount,
        currency: "INR",
        name: "Native Store",
        description: "Order Payment",
        order_id: paymentData.order.id,

        handler: async function (response) {
          /* 4️⃣ VERIFY PAYMENT */
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrderId, // 🔥 IMPORTANT
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            /* ✅ SUCCESS FLOW */
            cart.forEach((item) => removeFromCart(item._id));
            closeCart();

            router.push(`/order-success?orderId=${orderId}`);
          } else {
            alert("Payment verification failed");
          }
        },

        prefill: {
          name,
          contact: phone,
          email,
        },

        theme: {
          color: "#16a34a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("CHECKOUT ERROR:", err);
      alert("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1>Checkout</h1>

      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <textarea
        placeholder="Full Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={{ ...inputStyle, height: "80px" }}
      />

      <input
        placeholder="Pincode"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
        style={inputStyle}
      />

      <h2>Total ₹ {total}</h2>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          padding: "12px 20px",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          width: "100%",
        }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  border: "1px solid #ccc",
};
