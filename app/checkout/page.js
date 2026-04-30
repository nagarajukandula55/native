"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, setCart, closeCart } = useCart();

  const [loading, setLoading] = useState(false);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  /* ================= COUPON ================= */
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  /* ================= SAFE TOTAL ================= */
  const subtotal = useMemo(() => {
    return (cart || []).reduce((sum, item) => {
      const price = Number(item?.price || 0);
      const qty = Number(item?.qty || 1);
      return sum + price * qty;
    }, 0);
  }, [cart]);

  const finalAmount = Math.max(subtotal - discount, 0);

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= COUPON ================= */
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (code === "SAVE10") {
      setDiscount(subtotal * 0.1);
    } else if (code === "SAVE50") {
      setDiscount(50);
    } else {
      setDiscount(0);
      alert("Invalid coupon");
    }
  };

  /* ================= PAYMENT ================= */
  const handlePayment = async () => {
    try {
      setLoading(true);

      /* VALIDATION */
      if (!form.name || !form.phone || !form.address) {
        alert("Please fill required fields");
        setLoading(false);
        return;
      }

      if (!cart || cart.length === 0) {
        alert("Cart is empty");
        setLoading(false);
        return;
      }

      /* ================= CREATE ORDER ================= */
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          amount: Number(finalAmount),
          address: form,
          coupon,
          discount,
        }),
      });

      const data = await res.json();

      console.log("ORDER RESPONSE:", data); // 🔥 DEBUG

      /* ================= SAFETY CHECK ================= */
      if (!data?.success || !data?.order) {
        alert(data?.message || "Order creation failed");
        setLoading(false);
        return;
      }

      const order = data.order;

      if (!order?.id || !order?.amount) {
        console.error("Invalid Razorpay order:", order);
        alert("Invalid payment order");
        setLoading(false);
        return;
      }

      /* ================= RAZORPAY ================= */
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.id,

        name: "Native Store",
        description: "Order Payment",

        handler: async function (response) {
          console.log("PAYMENT RESPONSE:", response);

          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (verifyData?.success) {
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
      console.error("Checkout error:", err);
      alert("Payment error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="container">

      {/* FORM */}
      <div className="formBox">
        <h2>Checkout</h2>

        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />

        {/* COUPON */}
        <div className="couponBox">
          <input
            placeholder="Coupon Code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button onClick={applyCoupon}>Apply</button>
        </div>

        <button onClick={handlePayment} disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="summaryBox">
        <h3>Order Summary</h3>

        {(cart || []).map((item, i) => (
          <div key={i} className="row">
            <span>{item.name} x {item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}

        <hr />

        <div className="row">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        {discount > 0 && (
          <div className="row">
            <span>Discount</span>
            <span>- ₹{discount}</span>
          </div>
        )}

        <div className="total">
          <strong>Total</strong>
          <strong>₹{finalAmount}</strong>
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

        .couponBox {
          display: flex;
          gap: 10px;
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
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
