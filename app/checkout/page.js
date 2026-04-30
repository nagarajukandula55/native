"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "9000528462@ybl";
const UPI_NAME = "Native Store";

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

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= COUPON ================= */
  const applyCoupon = () => {
    if (coupon === "SAVE10") {
      setDiscount(cartTotal * 0.1);
    } else {
      setDiscount(0);
      alert("Invalid Coupon");
    }
  };

  const finalAmount = cartTotal - discount;

  /* ================= UPI LINK ================= */
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount}&cu=INR`;

  /* ================= PLACE ORDER ================= */
  const handleOrder = async () => {
    try {
      setLoading(true);

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

      /* ================= RAZORPAY ================= */
      if (paymentMethod === "razorpay") {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: finalAmount * 100,
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

      {/* LEFT - FORM */}
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
          Razorpay (Instant)
        </label>

        <label>
          <input
            type="radio"
            checked={paymentMethod === "upi"}
            onChange={() => setPaymentMethod("upi")}
          />
          UPI (GPay / PhonePe / Paytm)
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
          {loading ? "Processing..." : `Pay ₹${finalAmount}`}
        </button>
      </div>

      {/* RIGHT - SUMMARY */}
      <div className="box">
        <h3>Order Summary</h3>

        {cart.map((item) => (
          <div key={item.id || item.productKey} className="row">
            <span>{item.name} x {item.qty}</span>
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

        {/* UPI SECTION */}
        {paymentMethod === "upi" && (
          <div className="upiBox">

            <h4>Pay via UPI</h4>
            <p>{UPI_ID}</p>

            <QRCode value={upiLink} size={140} />

            <a href={upiLink} className="btn">Open UPI App</a>

            <a
              href={`gpay://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount}&cu=INR`}
              className="btn alt"
            >
              Open Google Pay
            </a>

            <a
              href={`phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount}&cu=INR`}
              className="btn alt"
            >
              Open PhonePe
            </a>

          </div>
        )}
      </div>

      {/* STYLE */}
      <style jsx>{`
        .checkout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          max-width: 1100px;
          margin: auto;
          padding: 20px;
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
          border-radius: 6px;
        }

        .coupon {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        button {
          width: 100%;
          padding: 12px;
          margin-top: 10px;
          background: black;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
        }

        .total {
          font-size: 18px;
        }

        .upiBox {
          margin-top: 20px;
          text-align: center;
        }

        .btn {
          display: block;
          margin-top: 10px;
          padding: 10px;
          background: green;
          color: white;
          border-radius: 6px;
          text-decoration: none;
        }

        .btn.alt {
          background: #111;
        }
      `}</style>

    </div>
  );
}
