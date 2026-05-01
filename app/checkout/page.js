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
    address: "",
    pincode: "",
    city: "",
    state: "",
    gstNumber: "", // ✅ added back
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
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

  const finalAmount = subtotal + gstTotal - discount;

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
    2
  )}&cu=INR`;

  const verifyGST = async () => {
    if (!form.gstNumber) return;
  
    setGstLoading(true);
  
    try {
      const res = await fetch("/api/gst/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gstNumber: form.gstNumber,
        }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        setGstData(data.data);
  
        setForm((prev) => ({
          ...prev,
          gstformatVerified: true,
        }));
      } else {
        setGstData(null);
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("GST verification failed");
    } finally {
      setGstLoading(false);
    }
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
          cart: safeCart,
          taxItems,
          address: form,
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
      
      if (paymentMethod === "razorpay") {
        new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(finalAmount * 100),
          order_id: data.razorpayOrder?.id,
      
          handler: async function (response) {
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderId,
                }),
              });
      
              const verifyData = await verifyRes.json();
      
              if (verifyData.success) {
                setCart([]);
                closeCart();
                router.push(`/order-success?orderId=${orderId}`);
              } else {
                alert("Payment verification failed ❌");
              }
            } catch (err) {
              console.error("Verify error:", err);
              alert("Payment verification error");
            }
          },
        }).open();
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
      <div className="box">
        <h2>Checkout</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />

        <input value={form.city} disabled placeholder="City" />
        <input value={form.state} disabled placeholder="State" />

        {/* ✅ GST FIELD */}
        <input
          name="gstNumber"
          placeholder="GST Number (for B2B)"
          value={form.gstNumber}
          onChange={handleChange}
          onBlur={verifyGST}
        />

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

        {gstData && (
          <div className="gstBox">
            <strong>GST Verified ✅</strong>
        
            <div className="gstRow">
              <span>Company:</span>
              <span>{gstData.legalName || "N/A"}</span>
            </div>
        
            <div className="gstRow">
              <span>Trade Name:</span>
              <span>{gstData.tradeName || "N/A"}</span>
            </div>
        
            <div className="gstRow">
              <span>State:</span>
              <span>{gstData.state || gstData.pradr?.addr?.st || "N/A"}</span>
            </div>
        
            <div className="gstRow">
              <span>State Code:</span>
              <span>{gstData.stateCode}</span>
            </div>
        
            <div className="gstRow">
              <span>GSTIN:</span>
              <span>{form.gstNumber}</span>
            </div>
          </div>
        )}

        {/* ✅ COUPON */}
        <div className="coupon">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Coupon"
          />
          <button onClick={applyCoupon}>Apply</button>
        </div>

        <button onClick={handleOrder} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${finalAmount.toFixed(2)}`}
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

        {!isInterState ? (
          <>
            <div className="row"><span>CGST</span><span>₹{cgstTotal}</span></div>
            <div className="row"><span>SGST</span><span>₹{sgstTotal}</span></div>
          </>
        ) : (
          <div className="row"><span>IGST</span><span>₹{igstTotal}</span></div>
        )}

        <div className="row total">
          <b>Total</b>
          <b>₹{finalAmount}</b>
        </div>

        {/* ✅ UPI */}
        {paymentMethod === "upi" && (
          <div>
            <QRCode value={upiLink} />
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
          border-radius: 12px;
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

        .gstBox {
          margin-top: 10px;
          padding: 10px;
          background: #f1fff1;
          border: 1px solid #b6e3b6;
          border-radius: 8px;
          font-size: 13px;
        }
        
        .gstRow {
          display: flex;
          justify-content: space-between;
          margin-top: 4px;
        }
     `}</style>
    </div>
  );
}
