"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, setCart, closeCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const UPI_ID = "9000528462@ybl";
  const finalAmount = Math.max(cartTotal - discount, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= COUPON ================= */
  const applyCoupon = async () => {
    if (coupon === "SAVE10") {
      setDiscount(cartTotal * 0.1);
    } else {
      setDiscount(0);
      alert("Invalid coupon");
    }
  };

  /* ================= ORDER ================= */
  const handleOrder = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          amount: finalAmount,
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

      sessionStorage.setItem("lastOrderId", orderId);
      setCart([]);
      closeCart();

      router.push(`/order-success?orderId=${orderId}`);
    } catch (err) {
      console.error(err);
      alert("Error placing order");
    }

    setLoading(false);
  };

  /* ================= UI ================= */
  return (
    <div className="checkout">

      {/* LEFT FORM */}
      <div className="box">
        <h2>Checkout</h2>

        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />

        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />
        <input name="state" placeholder="State" onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />

        <h3>Payment Method</h3>

        <label>
          <input
            type="radio"
            checked={paymentMethod === "razorpay"}
            onChange={() => setPaymentMethod("razorpay")}
          />
          Razorpay (Instant)
        </label>

        <label>
          <input
            type="radio"
            checked={paymentMethod === "upi"}
            onChange={() => setPaymentMethod("upi")}
          />
          UPI Payment
        </label>

        {/* UPI SECTION */}
        {paymentMethod === "upi" && (
          <div className="upiBox">
            <p><b>Pay using UPI ID:</b></p>
            <p className="upi">{UPI_ID}</p>

            <QRCode value={`upi://pay?pa=${UPI_ID}&am=${finalAmount}&cu=INR`} />

            <p>OR scan QR and pay ₹{finalAmount}</p>
          </div>
        )}

        {/* COUPON */}
        <div className="coupon">
          <input
            placeholder="Coupon Code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button onClick={applyCoupon}>Apply</button>
        </div>

        <button className="payBtn" onClick={handleOrder} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${finalAmount}`}
        </button>
      </div>

      {/* RIGHT SUMMARY */}
      <div className="box summary">
        <h3>Order Summary</h3>

        {cart.map((item) => (
          <div className="row" key={item._id}>
            <span>{item.name} × {item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}

        <hr />

        <div className="row">
          <span>Subtotal</span>
          <span>₹{cartTotal}</span>
        </div>

        <div className="row">
          <span>Discount</span>
          <span>-₹{discount}</span>
        </div>

        <div className="row total">
          <b>Total</b>
          <b>₹{finalAmount}</b>
        </div>
      </div>

      {/* STYLE */}
      <style jsx>{`
        .checkout {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 25px;
          padding: 30px;
          max-width: 1200px;
          margin: auto;
        }

        .box {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #eee;
        }

        input {
          width: 100%;
          padding: 10px;
          margin: 6px 0;
          border: 1px solid #ddd;
          border-radius: 6px;
        }

        label {
          display: block;
          margin: 8px 0;
        }

        .upiBox {
          padding: 10px;
          background: #f8f8f8;
          margin-top: 10px;
          border-radius: 8px;
        }

        .upi {
          font-weight: bold;
          margin-bottom: 10px;
        }

        .coupon {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .payBtn {
          width: 100%;
          padding: 12px;
          margin-top: 15px;
          background: black;
          color: white;
          border: none;
          border-radius: 8px;
        }

        .summary .row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
        }

        .total {
          font-size: 18px;
          margin-top: 10px;
        }

        @media(max-width: 768px){
          .checkout{
            grid-template-columns: 1fr;
          }
        }
      `}</style>

    </div>
  );
}
