"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= APPLY COUPON ================= */
  const applyCoupon = async () => {
    if (!coupon) return;

    // TEMP LOGIC (replace with API later)
    if (coupon === "SAVE10") {
      setDiscount(cartTotal * 0.1);
    } else {
      setDiscount(0);
      alert("Invalid Coupon");
    }
  };

  const finalAmount = cartTotal - discount;

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
        alert("Order creation failed");
        setLoading(false);
        return;
      }

      const order = data.order;

      /* ================= RAZORPAY ================= */
      if (paymentMethod === "razorpay") {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          order_id: order.id,

          handler: async function (response) {
            await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            setCart([]);
            closeCart();
            router.push("/order-success");
          },

          prefill: {
            name: form.name,
            contact: form.phone,
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

      /* ================= UPI MANUAL ================= */
      if (paymentMethod === "upi") {
        alert("Please pay to UPI: 9000528462@ybl");

        setCart([]);
        closeCart();
        router.push("/order-pending");
      }

    } catch (err) {
      console.error(err);
      alert("Error placing order");
    }

    setLoading(false);
  };

  return (
    <div className="container">

      {/* FORM */}
      <div className="formBox">
        <h2>Checkout</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} />

        {/* PAYMENT METHOD */}
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
          UPI (9000528462@ybl)
        </label>

        {/* COUPON */}
        <div style={{ marginTop: 10 }}>
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

      {/* SUMMARY */}
      <div className="summaryBox">
        <h3>Order Summary</h3>

        {cart.map((item) => (
          <div key={item.productId} className="row">
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
          <strong>Total</strong>
          <strong>₹{finalAmount}</strong>
        </div>
      </div>
    </div>
  );
}
