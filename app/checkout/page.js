"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "9000528462@ybl";
const UPI_NAME = "Native Store";
const SELLER_STATE = "Andhra Pradesh";

/* ================= GST SPLIT ================= */
const getGST = (base, gstPercent = 0) => {
  const gst = (base * gstPercent) / 100;

  return {
    cgst: gst / 2,
    sgst: gst / 2,
    gstTotal: gst,
  };
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, setCart, closeCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "Andhra Pradesh",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= COUPON (DB ONLY) ================= */
  const applyCoupon = async () => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: coupon,
          cartTotal,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setDiscount(0);
        alert(data.message || "Invalid Coupon");
        return;
      }

      setDiscount(data.discount);
      alert("Coupon Applied");
    } catch (err) {
      console.error(err);
      setDiscount(0);
      alert("Coupon Error");
    }
  };

  /* ================= TAX CALCULATION ================= */
  const taxItems = cart.map((item) => {
    const base = item.price * item.qty;

    const gstPercent = item.gstPercent || 0;
    const hsn = item.hsn || "0000";

    const tax = getGST(base, gstPercent);

    return {
      ...item,
      base,
      gstPercent,
      hsn,
      ...tax,
    };
  });

  const subtotal = cartTotal;

  const gstTotal = taxItems.reduce((a, b) => a + b.gstTotal, 0);
  const cgstTotal = taxItems.reduce((a, b) => a + b.cgst, 0);
  const sgstTotal = taxItems.reduce((a, b) => a + b.sgst, 0);

  const totalBeforeDiscount = subtotal + gstTotal;
  const finalAmount = totalBeforeDiscount - discount;

  /* ================= UPI ================= */
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
    2
  )}&cu=INR`;

  /* ================= PLACE ORDER ================= */
  const handleOrder = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          taxItems,
          address: form,
          coupon,
          discount,
          paymentMethod,
          gstSummary: {
            subtotal,
            gstTotal,
            cgstTotal,
            sgstTotal,
            finalAmount,
          },
          amount: finalAmount,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Order failed");
        return;
      }

      const orderId = data.orderId;

      sessionStorage.setItem("lastOrderId", orderId);

      /* ================= RAZORPAY ================= */
      if (paymentMethod === "razorpay") {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(finalAmount * 100),
          currency: "INR",
          order_id: data.razorpayOrderId,
          handler: () => {
            setCart([]);
            closeCart();
            router.push(`/order-success?orderId=${orderId}`);
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

      /* ================= UPI ================= */
      if (paymentMethod === "upi") {
        window.location.href = upiLink;
        router.push(`/order-pending?orderId=${orderId}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout">

      {/* ================= FORM ================= */}
      <div className="box">
        <h2>Checkout</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />

        <h4>Payment Method</h4>

        <label>
          <input
            type="radio"
            checked={paymentMethod === "razorpay"}
            onChange={() => setPaymentMethod("razorpay")}
          />
          Razorpay
        </label>

        <label>
          <input
            type="radio"
            checked={paymentMethod === "upi"}
            onChange={() => setPaymentMethod("upi")}
          />
          UPI Payment
        </label>

        {/* COUPON */}
        <div className="coupon">
          <input
            placeholder="Coupon Code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button onClick={applyCoupon}>Apply</button>
        </div>

        <button onClick={handleOrder} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${finalAmount.toFixed(2)}`}
        </button>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="box">
        <h3>Order Summary</h3>

        {taxItems.map((item, i) => (
          <div key={i}>
            <div className="row">
              <span>{item.name} x {item.qty}</span>
              <span>₹{item.base.toFixed(2)}</span>
            </div>

            <small>
              HSN: {item.hsn} | GST: {item.gstPercent}%
            </small>
          </div>
        ))}

        <hr />

        <div className="row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="row"><span>CGST</span><span>₹{cgstTotal.toFixed(2)}</span></div>
        <div className="row"><span>SGST</span><span>₹{sgstTotal.toFixed(2)}</span></div>

        <div className="row"><span>Total</span><span>₹{totalBeforeDiscount.toFixed(2)}</span></div>

        <div className="row"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>

        <div className="row total">
          <b>Final</b>
          <b>₹{finalAmount.toFixed(2)}</b>
        </div>

        {/* ================= UPI ================= */}
        {paymentMethod === "upi" && (
          <div className="upiBox">
            <h4>Pay via UPI</h4>

            <QRCode value={upiLink} size={140} />

            <a href={upiLink} className="btn">Open UPI App</a>

            <a href={`gpay://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount}`} className="btn">
              Google Pay
            </a>

            <a href={`phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount}`} className="btn">
              PhonePe
            </a>
          </div>
        )}
      </div>

      {/* ================= STYLE ================= */}
      <style jsx>{`
        .checkout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          max-width: 1100px;
          margin: auto;
        }

        .box {
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 10px;
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

        .coupon {
          display: flex;
          gap: 10px;
        }

        button {
          width: 100%;
          padding: 10px;
          background: black;
          color: white;
        }

        .btn {
          display: block;
          margin-top: 10px;
          padding: 10px;
          background: green;
          color: white;
          text-align: center;
          border-radius: 6px;
        }

        .total {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
