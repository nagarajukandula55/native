"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "9000528462@ybl";
const UPI_NAME = "Native";
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
    state: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= PINCODE AUTO FETCH ================= */
  useEffect(() => {
    const pin = form.pincode;

    if (!pin || pin.length !== 6) return;

    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${pin}`
        );

        const data = await res.json();

        if (data?.[0]?.Status === "Success") {
          const postOffice = data[0].PostOffice?.[0];

          setForm((prev) => ({
            ...prev,
            city: postOffice?.District || "",
            state: postOffice?.State || "",
          }));
        }
      } catch (err) {
        console.error("Pincode fetch error", err);
      }
    };

    const timer = setTimeout(fetchLocation, 500); // debounce
    return () => clearTimeout(timer);
  }, [form.pincode]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= COUPON ================= */
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

  /* ================= TAX ================= */
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

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
    2
  )}&cu=INR`;

  /* ================= ORDER ================= */
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
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />

        {/* AUTO FILLED */}
        <input name="city" value={form.city} disabled placeholder="City Auto" />
        <input name="state" value={form.state} disabled placeholder="State Auto" />

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

        <button onClick={handleOrder}>
          Pay ₹{finalAmount.toFixed(2)}
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
            <small>HSN: {item.hsn} | GST: {item.gstPercent}%</small>
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

        {paymentMethod === "upi" && (
          <div className="upiBox">
            <QRCode value={upiLink} size={140} />
            <a href={upiLink} className="btn">Open UPI App</a>
          </div>
        )}
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
          background: green;
          color: white;
          padding: 10px;
          text-align: center;
        }

        .total {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
