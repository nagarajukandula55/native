"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, setCart, closeCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);

  /* ================= INPUT HANDLER ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= CREATE ORDER ================= */
  const handlePayment = async () => {
    try {
      setLoading(true);

      if (!form.name || !form.phone || !form.address) {
        alert("Please fill required fields");
        setLoading(false);
        return;
      }

      // 1️⃣ Create order (backend)
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          amount: cartTotal,
          address: form,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Order creation failed");
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
        description: "Food Products Order",
        order_id: order.id,

        handler: async function (response) {
          // 3️⃣ Verify payment
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setCart([]);
            closeCart();

            router.push("/order-success");
          } else {
            router.push("/order-failed");
          }
        },

        prefill: {
          name: form.name,
          contact: form.phone,
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

      {/* LEFT - FORM */}
      <div className="formBox">
        <h2>Checkout</h2>

        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />

        <button onClick={handlePayment} disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>

      {/* RIGHT - SUMMARY */}
      <div className="summaryBox">
        <h3>Order Summary</h3>

        {cart.map((item) => (
          <div key={item._id} className="row">
            <span>{item.name} x {item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}

        <hr />

        <div className="total">
          <strong>Total</strong>
          <strong>₹{cartTotal}</strong>
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .container {
          display: flex;
          gap: 30px;
          padding: 40px;
          max-width: 1100px;
          margin: auto;
        }

        .formBox {
          flex: 2;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        button {
          padding: 12px;
          background: #c28b45;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }

        .summaryBox {
          flex: 1;
          background: #fafafa;
          padding: 20px;
          border-radius: 10px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .total {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
