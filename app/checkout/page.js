"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "9000528462@ybl";
const UPI_NAME = "Native";
const SELLER_STATE = "Andhra Pradesh";

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

/* ================= GST VALIDATION ================= */
const validateGST = (gst) => {
  if (!gst) return true;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, setCart, closeCart } = useCart();
  
  const [gstData, setGstData] = useState(null);
  const [gstLoading, setGstLoading] = useState(false);
  const [enrichedCart, setEnrichedCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    gstNumber: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  /* ================= CART ENRICHMENT ================= */
  useEffect(() => {
    const enrichCart = async () => {
      try {
        const res = await fetch("/api/cart/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        });

        const data = await res.json();

        if (data?.success && Array.isArray(data.cart)) {
          setEnrichedCart(data.cart);
        } else {
          setEnrichedCart(cart || []);
        }
      } catch (err) {
        console.error("Enrich error:", err);
        setEnrichedCart(cart || []);
      }
    };

    if (cart?.length) enrichCart();
    else setEnrichedCart([]);
  }, [cart]);

  /* ================= PINCODE AUTO ================= */
  useEffect(() => {
    if (form.pincode?.length !== 6) return;

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

    const t = setTimeout(fetchLocation, 400);
    return () => clearTimeout(t);
  }, [form.pincode]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= COUPON ================= */
  const applyCoupon = async () => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon, cartTotal }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        setDiscount(0);
        return;
      }

      setDiscount(data.discount);
    } catch (err) {
      console.error(err);
      alert("Coupon error");
    }
  };

  /* ================= SAFE CART ================= */
  const safeCart = enrichedCart?.length ? enrichedCart : cart || [];

  const isInterState =
    form.state && form.state !== SELLER_STATE;

  const taxItems = safeCart.map((item) => {
    const base = item.price * item.qty;

    const hsn = item.hsn || item.product?.hsn || "NOT_SET";
    const gstPercent = item.gstPercent || item.tax || 0;

    const tax = getGST(base, gstPercent, isInterState);

    return {
      ...item,
      base,
      hsn,
      gstPercent,
      ...tax,
    };
  });

  const subtotal = cartTotal || 0;

  const gstTotal = taxItems.reduce((a, b) => a + b.gstTotal, 0);
  const cgstTotal = taxItems.reduce((a, b) => a + b.cgst, 0);
  const sgstTotal = taxItems.reduce((a, b) => a + b.sgst, 0);
  const igstTotal = taxItems.reduce((a, b) => a + b.igst, 0);

  const finalAmount = Number(subtotal + gstTotal - discount) || 0;

  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${finalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent("Order Payment")}`;

  const upiApps = {
    gpay: `tez://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(2)}&cu=INR`,
    phonepe: `phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(2)}&cu=INR`,
    paytm: `paytmmp://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(2)}&cu=INR`,
  };

  /* ================= ORDER ================= */
  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      alert("Please fill all details");
      return;
    }

    if (!validateGST(form.gstNumber)) {
      alert("Invalid GST Number");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: safeCart.map(item => ({
            productId: item.productId || item._id || item.product?._id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            variant: item.variant || "default"
          })),
          taxItems,
          address: form,
          email: form.email,
          coupon,
          discount,
          paymentMethod,
          gstType: form.gstNumber ? "B2B" : "B2C",
          gstMode: isInterState ? "IGST" : "CGST_SGST",
          amount: finalAmount,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Order failed");
        return;
      }

      const orderId = data.orderId;

      if (paymentMethod === "RAZORPAY") {
        if (!data.razorpayOrder) {
          alert("Razorpay is temporarily disabled. Use UPI.");
          return;
        }

        new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(finalAmount * 100),
          order_id: data.razorpayOrder.id,
          handler: async function (response) {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setCart([]);
              closeCart();
              router.push(`/order-success?orderId=${orderId}`);
            } else {
              alert("Payment verification failed ❌");
            }
          }
        }).open();
      }

      if (paymentMethod === "UPI") {
        const isMobile = /Android|iPhone/i.test(navigator.userAgent);

        if (isMobile) {
          setTimeout(() => {
            window.location.href = upiLink;
          }, 300);
        } else {
          alert("Open on mobile or scan QR to pay 📱");
        }

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
      <div className="box">
        <h2>Checkout</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />

        <input value={form.city} disabled placeholder="City" />
        <input value={form.state} disabled placeholder="State" />

        <input
          name="gstNumber"
          placeholder="GST Number (for B2B)"
          value={form.gstNumber}
          onChange={handleChange}
        />

        <h4>Payment</h4>

        <label>
          <input
            type="radio"
            checked={paymentMethod === "RAZORPAY"}
            onChange={() => setPaymentMethod("RAZORPAY")}
          />
          Razorpay
        </label>

        <label>
          <input
            type="radio"
            checked={paymentMethod === "UPI"}
            onChange={() => setPaymentMethod("UPI")}
          />
          UPI
        </label>

        <button onClick={handleOrder} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${finalAmount.toFixed(2)}`}
        </button>
      </div>

      <div className="box">
        <h3>Order Summary</h3>

        <div className="row total">
          <b>Total</b>
          <b>₹{finalAmount}</b>
        </div>

        {paymentMethod === "UPI" && (
          <>
            <div>
              {finalAmount > 0 && <QRCode value={upiLink} />}
              <a href={upiLink} className="btn">Open UPI App</a>
            </div>

            <div style={{ marginTop: 10 }}>
              <a href={upiApps.gpay} className="btn">Pay with GPay</a>
              <a href={upiApps.phonepe} className="btn">Pay with PhonePe</a>
              <a href={upiApps.paytm} className="btn">Pay with Paytm</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
