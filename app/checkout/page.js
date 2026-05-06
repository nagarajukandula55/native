"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "nraj.k55@ybl";
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
        setEnrichedCart(data?.success ? data.cart : cart || []);
      } catch (err) {
        console.error(err);
        setEnrichedCart(cart || []);
      }
    };

    if (cart?.length) enrichCart();
    else setEnrichedCart([]);
  }, [cart]);

  /* ================= PINCODE ================= */
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

          setForm((p) => ({
            ...p,
            city: po?.District || "",
            state: po?.State || "",
          }));
        }
      } catch (e) {
        console.error(e);
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
    }
  };

  /* ================= SAFE CART ================= */
  const safeCart =
    Array.isArray(enrichedCart) && enrichedCart.length
      ? enrichedCart
      : Array.isArray(cart)
      ? cart
      : [];

  const isInterState = form.state && form.state !== SELLER_STATE;

  const taxItems = safeCart.map((item) => {
    const base = item.price * item.qty;

    const gstPercent = item.gstPercent || item.tax || 0;

    const tax = getGST(base, gstPercent, isInterState);

    return {
      ...item,
      base,
      gstPercent,
      ...tax,
    };
  });

  const subtotal = cartTotal || 0;

  const gstTotal = taxItems.reduce((a, b) => a + b.gstTotal, 0);
  const cgstTotal = taxItems.reduce((a, b) => a + b.cgst, 0);
  const sgstTotal = taxItems.reduce((a, b) => a + b.sgst, 0);
  const igstTotal = taxItems.reduce((a, b) => a + b.igst, 0);

  const finalAmount = subtotal + gstTotal - discount;

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
    2
  )}&cu=INR`;

  const upiApps = {
    gpay: `tez://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
      2
    )}&cu=INR`,
    phonepe: `phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
      2
    )}&cu=INR`,
    paytm: `paytmmp://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
      2
    )}&cu=INR`,
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

      if (!safeCart.length) {
        alert("Cart is empty");
        return;
      }

      const cleanedCart = safeCart
        .map((item) => {
          const productId =
            item.product?._id || item.productId || item._id;

          if (!productId) return null;

          return {
            productId,
            qty: item.qty || 1,
            variant: item.variant || "default",
            price: item.price || 0,
            name: item.name || item.product?.name || "",
          };
        })
        .filter(Boolean);

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cleanedCart,
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
        alert(data.message);
        return;
      }

      setCart([]);
      closeCart();

      const orderId = data.orderId;

      if (paymentMethod === "UPI") {
        window.location.href = upiLink;

        setTimeout(() => {
          router.push(`/order-pending?orderId=${orderId}`);
        }, 1200);
      }

      if (paymentMethod === "RAZORPAY") {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(finalAmount * 100),
          currency: "INR",
          name: "Native",
          order_id: data.razorpayOrder.id,
          handler: async function () {
            router.push(`/order-success?orderId=${orderId}`);
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="checkout">
      <div className="box">
        <h2>Checkout</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />

        <input value={form.city} disabled />
        <input value={form.state} disabled />

        <input
          name="gstNumber"
          placeholder="GST Number"
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
        <h3>Summary</h3>

        {taxItems.map((i, idx) => (
          <div key={idx}>
            {i.name} x {i.qty} = ₹{i.base}
          </div>
        ))}

        <h4>Total: ₹{finalAmount}</h4>
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
        }
      `}</style>
    </div>
  );
}
