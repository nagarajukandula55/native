"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

const UPI_ID = "9000528462@ybl";
const UPI_NAME = "Native Store";

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
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= COUPON ================= */
  const applyCoupon = (code, subtotal) => {
    const coupons = {
      SAVE10: { type: "percent", value: 10 },
      FLAT50: { type: "flat", value: 50 },
      FOOD20: { type: "percent", value: 20 },
    };
  
    const coupon = coupons[code];
  
    if (!coupon) return 0;
  
    if (coupon.type === "percent") {
      return (subtotal * coupon.value) / 100;
    }
  
    if (coupon.type === "flat") {
      return coupon.value;
    }
  
    return 0;
  };

  /* ================= PRODUCT-BASED TAX ================= */
  const taxItems = cart.map((item) => {
    const base = item.price * item.qty;

    // FROM PRODUCT UPLOAD PAGE (IMPORTANT)
    const gstPercent = item.gstPercent ?? 0;
    const hsn = item.hsn ?? "0000";

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

  /* ================= FINAL AMOUNT ================= */
  const totalBeforeDiscount = subtotal + gstTotal;
  const finalAmount = totalBeforeDiscount - discount;

  /* ================= UPI LINK ================= */
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
          gstSummary: {
            subtotal,
            gstTotal,
            cgstTotal,
            sgstTotal,
            discount,
            finalAmount,
          },
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

      /* ================= UPI REDIRECT ================= */
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

  /* ================= COUPON (ONLY FIXED PART) ================= */
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
          alert("Coupon Applied Successfully");
        } catch (err) {
          console.error(err);
          setDiscount(0);
          alert("Coupon Error");
        }
      };

      {/* ================= SUMMARY ================= */}
      <div className="box">
        <h3>Order Summary</h3>

        {taxItems.map((item) => (
          <div key={item.id || item.productKey}>
            <div className="row">
              <span>
                {item.name} x {item.qty}
              </span>
              <span>₹{item.base.toFixed(2)}</span>
            </div>

            <div className="mini">
              <small>
                HSN: {item.hsn} | GST: {item.gstPercent}%
              </small>
            </div>
          </div>
        ))}

        <hr />

        <div className="row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="row">
          <span>CGST</span>
          <span>₹{cgstTotal.toFixed(2)}</span>
        </div>

        <div className="row">
          <span>SGST</span>
          <span>₹{sgstTotal.toFixed(2)}</span>
        </div>

        <div className="row">
          <span>Total Before Discount</span>
          <span>₹{totalBeforeDiscount.toFixed(2)}</span>
        </div>

        <div className="row">
          <span>Discount</span>
          <span>-₹{discount.toFixed(2)}</span>
        </div>

        <div className="row total">
          <b>Final Total</b>
          <b>₹{finalAmount.toFixed(2)}</b>
        </div>

        {/* ================= UPI OPTIONS ================= */}
        {paymentMethod === "upi" && (
          <div className="upiBox">
            <h4>Pay via UPI</h4>

            <QRCode value={upiLink} size={140} />

            <a href={upiLink} className="btn">
              Open UPI App
            </a>

            <a
              href={`gpay://upi/pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
                2
              )}&cu=INR`}
              className="btn alt"
            >
              Google Pay
            </a>

            <a
              href={`phonepe://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${finalAmount.toFixed(
                2
              )}&cu=INR`}
              className="btn alt"
            >
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
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
        }

        .mini {
          font-size: 12px;
          color: gray;
          margin-bottom: 8px;
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
