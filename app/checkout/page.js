"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "9000528462@ybl";
const UPI_NAME = "Native";
const SELLER_STATE = "Andhra Pradesh";

/* ================= HELPER ================= */
const isMobile = () =>
  typeof window !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/* ================= GST ================= */
const getGST = (base, gstPercent = 0, isInterState) => {
  const gst = (base * gstPercent) / 100;

  if (isInterState) {
    return { igst: gst, cgst: 0, sgst: 0, gstTotal: gst };
  }

  return {
    cgst: gst / 2,
    sgst: gst / 2,
    igst: 0,
    gstTotal: gst,
  };
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, setCart, closeCart } = useCart();

  const [enrichedCart, setEnrichedCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });

  /* 🔥 FIX: default to UPI */
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const [discount, setDiscount] = useState(0);

  /* ================= CART ================= */
  const safeCart = enrichedCart?.length ? enrichedCart : cart || [];

  const isInterState =
    form.state && form.state !== SELLER_STATE;

  const subtotal = cartTotal || 0;

  const gstTotal = safeCart.reduce((acc, item) => {
    const base = item.price * item.qty;
    const gst = (base * (item.tax || 0)) / 100;
    return acc + gst;
  }, 0);

  const finalAmount = subtotal + gstTotal - discount;

  /* ================= 🔥 FIXED UPI LINK ================= */
  const buildUPI = (app = "generic") => {
    const txnId = "ORD" + Date.now();

    const base = `pa=${UPI_ID}&pn=${encodeURIComponent(
      UPI_NAME
    )}&am=${finalAmount.toFixed(2)}&cu=INR&tn=Order-${txnId}&tr=${txnId}`;

    if (app === "gpay") return `tez://upi/pay?${base}`;
    if (app === "phonepe") return `phonepe://pay?${base}`;
    if (app === "paytm") return `paytmmp://pay?${base}`;

    return `upi://pay?${base}`;
  };

  /* ================= ORDER ================= */
  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Fill all details");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: safeCart,
          address: form,
          paymentMethod: "UPI", // 🔥 force correct
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Order failed");
        return;
      }

      const orderId = data.orderId;

      /* ================= UPI FLOW ================= */

      if (!isMobile()) {
        alert("📱 Please complete payment using mobile");
        return;
      }

      window.location.href = buildUPI();

      router.push(`/order-pending?orderId=${orderId}`);

    } catch (err) {
      console.error(err);
      alert("Order error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout">
      <div className="box">
        <h2>Checkout</h2>

        <input name="name" placeholder="Name" onChange={(e)=>setForm({...form,name:e.target.value})} />
        <input name="phone" placeholder="Phone" onChange={(e)=>setForm({...form,phone:e.target.value})} />
        <input name="address" placeholder="Address" onChange={(e)=>setForm({...form,address:e.target.value})} />
        <input name="pincode" placeholder="Pincode" onChange={(e)=>setForm({...form,pincode:e.target.value})} />

        <h4>Payment</h4>

        {/* 🔥 Only UPI shown */}
        <label>
          <input checked readOnly type="radio" />
          UPI
        </label>

        {/* 🔥 UPI APP BUTTONS */}
        <div className="upiApps">
          <a href={buildUPI("gpay")}>Google Pay</a>
          <a href={buildUPI("phonepe")}>PhonePe</a>
          <a href={buildUPI("paytm")}>Paytm</a>
        </div>

        <button onClick={handleOrder} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${finalAmount.toFixed(2)}`}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="box">
        <h3>Order Summary</h3>

        {safeCart.map((item, i) => (
          <div key={i} className="row">
            <span>{item.name} x {item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}

        <hr />

        <div className="row"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div className="row"><span>GST</span><span>₹{gstTotal}</span></div>

        <div className="row total">
          <b>Total</b>
          <b>₹{finalAmount}</b>
        </div>

        {/* 🔥 QR FIXED */}
        <QRCode value={buildUPI()} />
      </div>

      <style jsx>{`
        .checkout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .box {
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 12px;
        }
        input {
          width: 100%;
          padding: 10px;
          margin: 5px 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
        }
        button {
          width: 100%;
          padding: 10px;
          background: black;
          color: white;
        }
        .upiApps a {
          display: inline-block;
          margin: 5px;
          padding: 8px 12px;
          background: #eee;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
