"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://www.angroup.in";

/* =========================================================
   VALIDATIONS
========================================================= */

const validateGST = (gst: string) => {
  if (!gst) return true;

  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
    gst
  );
};

const validatePhone = (phone: string) => {
  return /^[6-9]\d{9}$/.test(phone);
};

const validateEmail = (email: string) => {
  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

const safeNumber = (v: any) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    setCart,
    closeCart,
  } = useCart() as any;

  const razorpayLoaded = useRef(false);

  /* =========================================================
     STATES
  ========================================================= */

  const [loading, setLoading] = useState(false);

  const [coupon, setCoupon] = useState("");

  const [couponData, setCouponData] = useState<any>(null);

  const [gstData, setGstData] = useState<any>(null);

  const [errors, setErrors] = useState<any>({});

  const [orderSummary, setOrderSummary] = useState<any>({
    items: [],
  });

  const [summary, setSummary] = useState({
    subtotal: 0,
    discount: 0,
    taxableAmount: 0,
    gstTotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 0,
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    gstNumber: "",
  });

  /* =========================================================
     LOAD RAZORPAY
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.Razorpay) {
      razorpayLoaded.current = true;
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      razorpayLoaded.current = true;
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      razorpayLoaded.current = true;
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  /* =========================================================
     PINCODE AUTO FETCH
  ========================================================= */

  useEffect(() => {
    if (form.pincode.length !== 6) return;

    let mounted = true;

    const fetchLocation = async () => {
      try {
    const res = await fetch(
            `/api/pincode/${form.pincode}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (
          mounted &&
          data?.[0]?.Status === "Success"
        ) {
          const po = data[0]?.PostOffice?.[0];

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

    fetchLocation();

    return () => {
      mounted = false;
    };
  }, [form.pincode]);

  /* =========================================================
     INPUT
  ========================================================= */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================================================
     GST VERIFY
  ========================================================= */

  const verifyGST = async () => {
    if (!form.gstNumber) {
      setGstData(null);
      return;
    }

    if (!validateGST(form.gstNumber)) {
      setErrors((prev: any) => ({
        ...prev,
        gstNumber: "Invalid GST Number",
      }));
      return;
    }

    try {
      const res = await fetch("/api/gst/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gstNumber: form.gstNumber,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setGstData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================================================
     APPLY COUPON
  ========================================================= */

  const applyCoupon = async () => {
    if (!coupon) return;

    try {
      const res = await fetch(
        "/api/coupons/validate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: coupon }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        setCouponData(null);
        return;
      }

      setCouponData(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================================================
     SUMMARY (LOCAL PREVIEW ONLY)
  ========================================================= */

  const previewSummary = useMemo(() => {
    const subtotal = cart.reduce(
      (acc: number, item: any) =>
        acc +
        safeNumber(item.price) *
          safeNumber(item.qty),
      0
    );

    const discount = safeNumber(couponData?.discount);

    return {
      subtotal,
      discount,
      grandTotal: Math.max(0, subtotal - discount),
    };
  }, [cart, couponData]);

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.name) newErrors.name = "Name required";

    if (!validatePhone(form.phone)) {
      newErrors.phone = "Invalid mobile number";
    }

    if (!validateEmail(form.email)) {
      newErrors.email = "Invalid email";
    }

    if (!form.address) newErrors.address = "Address required";

    if (form.pincode.length !== 6) {
      newErrors.pincode = "Invalid pincode";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     PAY
  ========================================================= */

  const handlePay = async () => {
    if (!validateForm()) return;

    if (!razorpayLoaded.current) {
      alert("Payment gateway loading...");
      return;
    }

    try {
      setLoading(true);

      const cleanedCart = cart
        .filter((item: any) => item.productId || item._id)
        .map((item: any) => ({
          productKey: item.productKey,
          qty: Math.max(1, Number(item.qty || 1)),
          variant: item.variant || "default",
        }));
      
      if (!cleanedCart.length) {
        alert("Cart is invalid. Please refresh and add products again.");
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/orders/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: cleanedCart,
            address: form,
            coupon,
            paymentMethod: "RAZORPAY",
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Order failed");
        setLoading(false);
        return;
      }

      setOrderSummary({ items: data.items || [] });

      setSummary({
        subtotal: safeNumber(data.subtotal),
        discount: safeNumber(data.discount),
        taxableAmount: safeNumber(data.taxableAmount),
        gstTotal: safeNumber(data.gstTotal),
        cgst: safeNumber(data.cgst),
        sgst: safeNumber(data.sgst),
        igst: safeNumber(data.igst),
        grandTotal: safeNumber(data.amount),
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "Native",
        description: "Secure Checkout",
        order_id: data.razorpayOrder.id,

        prefill: {
          name: form.name,
          contact: form.phone,
          email: form.email,
        },

        notes: {
          orderId: data.orderId,
        },

        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(
              `${API_BASE}/api/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    response.razorpay_order_id,
                  razorpay_payment_id:
                    response.razorpay_payment_id,
                  razorpay_signature:
                    response.razorpay_signature,
                  orderId: data.orderId,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setCart([]);
              closeCart();
              router.push(
                `/order-success?orderId=${data.orderId}`
              );
            } else {
              alert(
                verifyData.message ||
                  "Payment verification failed"
              );
            }
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },

        modal: {
          ondismiss: () => setLoading(false),
        },

        theme: { color: "#111827" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
      setLoading(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="checkoutWrapper">
      <div className="bgGlow" />

      <div className="checkoutGrid">

        {/* LEFT */}
        <div className="leftBox">
          <div className="card">
            <div className="header">
              <h1>Secure Checkout</h1>
              <p>Enterprise-grade protected payment</p>
            </div>

            <div className="section">
              <h3>Customer Details</h3>

              <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" />
              {errors.name && <p className="error">{errors.name}</p>}

              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" />
              {errors.phone && <p className="error">{errors.phone}</p>}

              <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" />
            </div>

            <div className="section">
              <h3>Delivery Address</h3>

              <textarea name="address" value={form.address} onChange={handleChange} placeholder="Complete Address" />

              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" />

              <div className="doubleGrid">
                <input value={form.city} disabled placeholder="City" />
                <input value={form.state} disabled placeholder="State" />
              </div>
            </div>

            <div className="section">
              <h3>GST Details</h3>

              <input name="gstNumber" value={form.gstNumber} onChange={handleChange} onBlur={verifyGST} placeholder="GST (Optional)" />

              {gstData && (
                <div className="successBox">GST Verified</div>
              )}
            </div>

            <div className="section">
              <h3>Coupon</h3>

              <div className="couponRow">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon Code" />
                <button className="couponBtn" onClick={applyCoupon}>Apply</button>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="rightBox">
          <div className="summaryCard">

            <h2>Order Summary</h2>

            <div className="items">
              {orderSummary.items.map((item: any, i: number) => (
                <div className="item" key={i}>
                  <div>
                    <h4>{item.name}</h4>
                    <p>Qty: {item.qty}</p>
                    <p>GST: {item.gstRate}%</p>
                    <p>Taxable: ₹{safeNumber(item.taxableValue).toFixed(2)}</p>
                  </div>

                  <div className="price">
                    ₹{safeNumber(item.lineTotal).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary">
              <div className="summaryRow">
                <span>Subtotal</span>
                <span>₹{previewSummary.subtotal.toFixed(2)}</span>
              </div>

              {previewSummary.discount > 0 && (
                <div className="summaryRow success">
                  <span>Discount</span>
                  <span>- ₹{previewSummary.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="grandTotal">
                <span>Grand Total</span>
                <span>₹{previewSummary.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button className="payBtn" onClick={handlePay} disabled={loading}>
              {loading
                ? "Processing..."
                : `Pay ₹${previewSummary.grandTotal.toFixed(2)}`}
            </button>

            <div className="secureNote">🔒 Protected by Razorpay Secure</div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .checkoutWrapper {
          min-height: 100vh;
          background:
            linear-gradient(
              180deg,
              #f8fafc,
              #eef2ff
            );
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .bgGlow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: rgba(99,102,241,.12);
          filter: blur(120px);
          top: -200px;
          right: -200px;
          border-radius: 50%;
        }

        .checkoutGrid {
          max-width: 1400px;
          margin: auto;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 28px;
          position: relative;
          z-index: 2;
        }

        .card,
        .summaryCard {
          background: rgba(255,255,255,.75);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 30px;
          border: 1px solid rgba(255,255,255,.7);
          box-shadow:
            0 10px 40px rgba(0,0,0,.08);
          animation:
            fadeUp .5s ease;
        }

        .header h1 {
          font-size: 34px;
          margin-bottom: 8px;
          color: #0f172a;
        }

        .header p {
          color: #64748b;
          margin-bottom: 30px;
        }

        .section {
          margin-bottom: 30px;
        }

        .section h3 {
          margin-bottom: 14px;
          color: #111827;
        }

        input,
        textarea {
          width: 100%;
          padding: 15px;
          border-radius: 16px;
          border: 1px solid #dbe2ea;
          margin-bottom: 12px;
          font-size: 15px;
          transition: all .25s ease;
          background: white;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #111827;
          transform: translateY(-1px);
          box-shadow:
            0 8px 20px rgba(0,0,0,.06);
        }

        textarea {
          min-height: 110px;
          resize: vertical;
        }

        .doubleGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .couponRow {
          display: flex;
          gap: 10px;
        }

        .couponBtn,
        .payBtn {
          border: none;
          background: linear-gradient(
            135deg,
            #111827,
            #1e293b
          );
          color: white;
          border-radius: 16px;
          cursor: pointer;
          font-weight: 600;
          transition: .25s ease;
        }

        .couponBtn {
          width: 120px;
        }

        .couponBtn:hover,
        .payBtn:hover {
          transform: translateY(-2px);
        }

        .payBtn {
          width: 100%;
          padding: 18px;
          font-size: 16px;
          margin-top: 24px;
        }

        .summaryCard h2 {
          margin-bottom: 24px;
        }

        .item {
          display: flex;
          justify-content: space-between;
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid #eef2f7;
        }

        .item h4 {
          margin-bottom: 6px;
        }

        .item p {
          font-size: 14px;
          color: #64748b;
        }

        .price {
          font-weight: 700;
        }

        .summary {
          margin-top: 24px;
        }

        .summaryRow,
        .grandTotal {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .grandTotal {
          border-top: 1px solid #e2e8f0;
          padding-top: 18px;
          margin-top: 18px;
          font-size: 22px;
          font-weight: 800;
        }

        .error {
          color: #dc2626;
          font-size: 13px;
          margin-top: -5px;
          margin-bottom: 12px;
        }

        .success {
          color: #16a34a;
        }

        .successBox {
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          padding: 14px;
          border-radius: 14px;
          color: #166534;
        }

        .secureNote {
          margin-top: 18px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          .checkoutGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .checkoutWrapper {
            padding: 20px 12px;
          }

          .card,
          .summaryCard {
            padding: 20px;
          }

          .doubleGrid {
            grid-template-columns: 1fr;
          }

          .couponRow {
            flex-direction: column;
          }

          .couponBtn {
            width: 100%;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}
