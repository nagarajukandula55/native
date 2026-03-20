"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, closeCart, removeFromCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState(null);
  const [method, setMethod] = useState("COD");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* ================= LOAD PAYMENT SETTINGS ================= */
  useEffect(() => {
    fetch("/api/payment/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPaymentSettings(data.settings);
      });
  }, []);

  /* ================= COMMON VALIDATION ================= */
  const validate = () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return false;
    }

    if (!name || !phone || !address || !pincode) {
      alert("Please fill all required fields");
      return false;
    }

    return true;
  };

  /* ================= PLACE ORDER (COD) ================= */
  async function placeOrder() {
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          phone,
          email,
          address,
          pincode,
          items: cart,
          paymentMethod: "COD",
        }),
      });

      const data = await res.json();

      if (data.success) {
        cart.forEach((item) => removeFromCart(item._id));
        closeCart();

        router.push(`/order-success?orderId=${data.orderId}`);
      } else {
        alert("Order failed");
      }
    } catch (err) {
      alert("Server error");
    }

    setLoading(false);
  }

  /* ================= RAZORPAY ================= */
  async function handlePayment() {
    if (!validate()) return;

    setLoading(true);

    try {
      // 1️⃣ Create Order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name,
          phone,
          email,
          address,
          pincode,
          items: cart,
          paymentMethod: "ONLINE",
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Order creation failed");
        setLoading(false);
        return;
      }

      const orderId = orderData.orderId;
      const dbOrderId = orderData._id;

      // 2️⃣ Razorpay Order
      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentData.success) {
        alert("Payment failed");
        setLoading(false);
        return;
      }

      // 3️⃣ Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: paymentData.order.amount,
        currency: "INR",
        name: "Native Store",
        order_id: paymentData.order.id,

        handler: async function (response) {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...response,
              orderId: dbOrderId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            cart.forEach((item) => removeFromCart(item._id));
            closeCart();

            router.push(`/order-success?orderId=${orderId}`);
          } else {
            alert("Payment verification failed");
          }
        },

        prefill: { name, contact: phone, email },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment error");
    }

    setLoading(false);
  }

  /* ================= MAIN HANDLER ================= */
  async function handleCheckout() {
    if (!paymentSettings) return;

    if (method === "COD") return placeOrder();

    if (method === "WHATSAPP") {
      const msg = `
Order Request
Name: ${name}
Phone: ${phone}
Address: ${address}
Pincode: ${pincode}
Total: ₹${total}
      `;

      window.open(
        `https://wa.me/${paymentSettings.whatsappNumber}?text=${encodeURIComponent(
          msg
        )}`,
        "_blank"
      );
      return;
    }

    if (method === "RAZORPAY") return handlePayment();
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h1>Checkout</h1>

      <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <textarea placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ ...inputStyle, height: "80px" }} />
      <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} style={inputStyle} />

      <h2>Total ₹ {total}</h2>

      {/* PAYMENT OPTIONS */}
      {paymentSettings && (
        <div style={{ margin: "20px 0" }}>
          <h3>Select Payment Method</h3>

          {paymentSettings.cod && (
            <label>
              <input type="radio" checked={method === "COD"} onChange={() => setMethod("COD")} />
              COD
            </label>
          )}

          {paymentSettings.whatsapp && (
            <label>
              <input type="radio" checked={method === "WHATSAPP"} onChange={() => setMethod("WHATSAPP")} />
              WhatsApp
            </label>
          )}

          {paymentSettings.razorpay && (
            <label>
              <input type="radio" checked={method === "RAZORPAY"} onChange={() => setMethod("RAZORPAY")} />
              Pay Online
            </label>
          )}
        </div>
      )}

      <button onClick={handleCheckout} disabled={loading} style={btnStyle}>
        {loading ? "Processing..." : "Continue"}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  border: "1px solid #ccc",
};

const btnStyle = {
  padding: "12px",
  background: "#16a34a",
  color: "#fff",
  width: "100%",
  border: "none",
};
