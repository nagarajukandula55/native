"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, setCart } = useCart();

  const [form, setForm] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const GST_RATE = 0.18;

  const subtotal = cartTotal;
  const taxable = subtotal - discount;
  const gst = taxable * GST_RATE;
  const total = taxable + gst;

  const upiId = "9000528462@ybl";
  const upiLink = `upi://pay?pa=${upiId}&pn=Native&am=${total.toFixed(2)}&cu=INR`;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const applyCoupon = () => {
    if (coupon === "SAVE10") {
      setDiscount(subtotal * 0.1);
    } else {
      setDiscount(0);
      alert("Invalid coupon");
    }
  };

  const placeOrder = async () => {
    setLoading(true);

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart,
        amount: total,
        address: form,
        coupon,
        discount,
        paymentMethod,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Order failed");
      setLoading(false);
      return;
    }

    const orderId = data.orderId;
    sessionStorage.setItem("orderId", orderId);

    setCart([]);

    router.push(`/order-success?orderId=${orderId}`);
    setLoading(false);
  };

  return (
    <div className="checkout">

      {/* LEFT */}
      <div className="box">

        <h2>Checkout</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />

        {/* PAYMENT */}
        <h3>Payment Method</h3>

        <label>
          <input type="radio" checked={paymentMethod==="razorpay"}
            onChange={() => setPaymentMethod("razorpay")} />
          Razorpay (Instant)
        </label>

        <label>
          <input type="radio" checked={paymentMethod==="upi"}
            onChange={() => setPaymentMethod("upi")} />
          UPI Payment
        </label>

        {/* UPI SECTION */}
        {paymentMethod === "upi" && (
          <div className="upiBox">

            <h4>Scan & Pay</h4>

            <QRCode value={upiLink} size={180} />

            <p>UPI ID: <b>{upiId}</b></p>

            <a href={upiLink} className="payBtn">
              Pay via GPay / PhonePe
            </a>

          </div>
        )}

        {/* COUPON */}
        <div className="coupon">
          <input
            placeholder="Coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button onClick={applyCoupon}>Apply</button>
        </div>

        <button onClick={placeOrder} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
        </button>

      </div>

      {/* RIGHT */}
      <div className="box">

        <h3>Bill Summary</h3>

        <div className="row"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div className="row"><span>Discount</span><span>-₹{discount}</span></div>
        <div className="row"><span>GST (18%)</span><span>₹{gst.toFixed(2)}</span></div>

        <hr />

        <div className="row total">
          <b>Total</b>
          <b>₹{total.toFixed(2)}</b>
        </div>

      </div>

      <style jsx>{`
        .checkout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 30px;
        }

        .box {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #eee;
        }

        input {
          width: 100%;
          padding: 10px;
          margin: 6px 0;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }

        .upiBox {
          margin-top: 15px;
          text-align: center;
        }

        .payBtn {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 15px;
          background: black;
          color: white;
          border-radius: 8px;
          text-decoration: none;
        }

        .coupon {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        button {
          width: 100%;
          margin-top: 15px;
          padding: 12px;
          background: green;
          color: white;
          border: none;
          border-radius: 8px;
        }

        .total {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
