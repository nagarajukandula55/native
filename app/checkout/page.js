"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "9000528462@ybl";
const UPI_NAME = "Native";

/* ================= TAX HELPER ================= */
const getTaxSplit = (base, gstPercent = 0) => {
  const gstTotal = (base * gstPercent) / 100;

  return {
    cgst: gstTotal / 2,
    sgst: gstTotal / 2,
    gstTotal,
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
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= PINCODE AUTO FETCH ================= */
  const fetchPincodeDetails = async (pincode) => {
    if (pincode.length !== 6) return;

    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      const data = await res.json();

      if (data?.[0]?.Status === "Success") {
        const postOffice = data[0].PostOffice[0];

        setForm((prev) => ({
          ...prev,
          city: postOffice.District || "",
          state: postOffice.State || "",
        }));
      }
    } catch (err) {
      console.error("Pincode fetch error:", err);
    }
  };

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

    const tax = getTaxSplit(base, gstPercent);

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

        {/* PINCODE AUTO FETCH */}
        <input
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={(e) => {
            const value = e.target.value;

            setForm({ ...form, pincode: value });

            fetchPincodeDetails(value);
          }}
        />

        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
        />

        <input
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
        />

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
            <h4>Pay via UPI</h4>
            <QRCode value={upiLink} size={140} />
          </div>
        )}
      </div>
    </div>
  );
}
