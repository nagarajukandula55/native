"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "9000528462@ybl";
const UPI_NAME = "Native Store";
const SELLER_STATE = "Andhra Pradesh";
const [enrichedCart, setEnrichedCart] = useState([]);

/* ================= GST ================= */
const getGST = (base, gstPercent = 0) => {
  const gst = (base * gstPercent) / 100;

  return {
    cgst: gst / 2,
    sgst: gst / 2,
    igst: gst,
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
    pincode: "",
    city: "",
    state: "",
    gstNumber: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gstVerified, setGstVerified] = useState(null);

  /* =========================================================
     🧠 1. CART AUTO ENRICHMENT (FIX HSN + GST ISSUE)
  ========================================================= */
  useEffect(() => {
    const enrichCart = async () => {
      try {
        const res = await fetch("/api/cart/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        });

        const data = await res.json();

        if (data.success) {
          setCart(data.cart);
        }
      } catch (err) {
        console.error("Cart enrich failed", err);
      }
    };

    if (cart?.length) enrichCart();
  }, []);

   /* =========================================================
                      Enrich
  ========================================================= */

  useEffect(() => {
  const enrichCart = async () => {
    try {
      const res = await fetch("/api/cart/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });

      const data = await res.json();

      if (data.success) {
        setEnrichedCart(data.cart);
      } else {
        setEnrichedCart(cart);
      }
    } catch (err) {
      console.error("Enrich failed", err);
      setEnrichedCart(cart);
    }
  };

  if (cart?.length) enrichCart();
}, [cart]);

  /* =========================================================
     🔎 2. GSTIN VALIDATION (B2B CHECK)
  ========================================================= */
  const validateGSTIN = async (gstin) => {
    if (!gstin || gstin.length !== 15) return;

    try {
      const res = await fetch("/api/gst/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gstin }),
      });

      const data = await res.json();

      if (data.success) {
        setGstVerified(data.gst);

        setForm((prev) => ({
          ...prev,
          state: data.gst.state || prev.state,
        }));
      } else {
        setGstVerified(null);
      }
    } catch (err) {
      console.error("GST validation failed", err);
    }
  };

  /* ================= PINCODE AUTO FETCH ================= */
  useEffect(() => {
    if (!form.pincode || form.pincode.length !== 6) return;

    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${form.pincode}`
        );
        const data = await res.json();

        if (data?.[0]?.Status === "Success") {
          const po = data[0].PostOffice?.[0];

          setForm((prev) => ({
            ...prev,
            city: po?.District || "",
            state: po?.State || "",
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(fetchLocation, 400);
    return () => clearTimeout(timer);
  }, [form.pincode]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= COUPON ================= */
  const applyCoupon = async () => {
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, cartTotal }),
    });

    const data = await res.json();

    if (!data.success) {
      setDiscount(0);
      return;
    }

    setDiscount(data.discount);
  };

  /* ================= TAX ================= */
  const taxItems = cart.map((item) => {
    const base = item.price * item.qty;

    const product = item.product || {};

    const hsn = product.hsn || item.hsn || "UNKNOWN";
    const gstPercent = product.tax ?? item.gstPercent ?? 0;

    const tax = getGST(base, gstPercent);

    return {
      ...item,
      base,
      hsn,
      gstPercent,
      ...tax,
    };
  });

  const subtotal = cartTotal;
  const gstTotal = taxItems.reduce((a, b) => a + b.gstTotal, 0);
  const cgstTotal = taxItems.reduce((a, b) => a + b.cgst, 0);
  const sgstTotal = taxItems.reduce((a, b) => a + b.sgst, 0);
  const igstTotal = taxItems.reduce((a, b) => a + b.igst, 0);

  const totalBeforeDiscount = subtotal + gstTotal;
  const finalAmount = totalBeforeDiscount - discount;

  const isB2B = !!form.gstNumber;
  const isInterState = form.state && form.state !== SELLER_STATE;

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
          gstType: isB2B ? "B2B" : "B2C",
          gstMode: isInterState ? "IGST" : "CGST_SGST",
          gstSummary: {
            subtotal,
            gstTotal,
            cgstTotal,
            sgstTotal,
            igstTotal,
            finalAmount,
          },
          amount: finalAmount,
        }),
      });

      const data = await res.json();

      if (!data.success) return;

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

        new window.Razorpay(options).open();
      }

      if (paymentMethod === "upi") {
        window.location.href = upiLink;
        router.push(`/order-pending?orderId=${orderId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout">

      {/* FORM */}
      <div className="box">
        <h2>Checkout</h2>

        <input name="name" onChange={handleChange} placeholder="Name" />
        <input name="phone" onChange={handleChange} placeholder="Phone" />
        <input name="address" onChange={handleChange} placeholder="Address" />
        <input name="pincode" onChange={handleChange} placeholder="Pincode" />

        <input value={form.city} disabled placeholder="City" />
        <input value={form.state} disabled placeholder="State" />

        {/* 🔎 GST INPUT (B2B) */}
        <input
          name="gstNumber"
          placeholder="GST Number (B2B)"
          onChange={(e) => {
            handleChange(e);
            validateGSTIN(e.target.value);
          }}
        />

        {gstVerified && (
          <p style={{ color: "green" }}>
            ✔ Verified: {gstVerified.name}
          </p>
        )}

        <h4>Payment</h4>

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
          UPI
        </label>

        <div className="coupon">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Coupon"
          />
          <button onClick={applyCoupon}>Apply</button>
        </div>

        <button onClick={handleOrder}>
          Pay ₹{finalAmount.toFixed(2)}
        </button>
      </div>

      {/* SUMMARY */}
      <div className="box">
        <h3>Order Summary</h3>

        {taxItems.map((item, i) => (
          <div key={i}>
            <div className="row">
              <span>{item.name} x {item.qty}</span>
              <span>₹{item.base}</span>
            </div>

            <small>
              HSN: {item.hsn} | GST: {item.gstPercent}%
            </small>
          </div>
        ))}

        <hr />

        <div className="row"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div className="row"><span>CGST</span><span>₹{cgstTotal}</span></div>
        <div className="row"><span>SGST</span><span>₹{sgstTotal}</span></div>

        {isInterState && (
          <div className="row"><span>IGST</span><span>₹{igstTotal}</span></div>
        )}

        <div className="row total">
          <b>Total</b>
          <b>₹{finalAmount}</b>
        </div>

        {paymentMethod === "upi" && (
          <div>
            <QRCode value={upiLink} />
          </div>
        )}
      </div>
    </div>
  );
}
