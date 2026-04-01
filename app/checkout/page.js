"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import QRCode from "qrcode.react";

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
  const [upiPlaced, setUpiPlaced] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    fetch("/api/admin/payment-settings")
      .then(res => res.json())
      .then(data => {
        if (data.success) setPaymentSettings(data.settings);
      });
  }, []);

  /* ================= VALIDATION ================= */
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

  /* ================= CLEAR CART ================= */
  const clearCart = () => {
    cart.forEach(item => removeFromCart(item._id));
    closeCart();
  };

  /* ================= CHECKOUT ================= */
  async function handleCheckout() {
    if (!validate()) return;

    setLoading(true);

    try {
      /* ✅ FIX: CLEAN ITEMS STRUCTURE */
      const formattedItems = cart.map(item => ({
        productId: item._id,   // 🔥 CRITICAL FIX
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const body = {
        customerName: name,
        phone,
        email,
        address,
        pincode,
        items: formattedItems, // ✅ FIXED
        paymentMethod: method,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      /* 🔥 HANDLE EMPTY RESPONSE SAFELY */
      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok || !data.success) {
        alert(data.msg || "Order creation failed");
        setLoading(false);
        return;
      }

      /* ================= COD / WHATSAPP ================= */
      if (method === "COD" || method === "WHATSAPP") {
        clearCart();
        router.push(`/order-success?orderId=${data.order?.orderId}`);
      }

      /* ================= UPI ================= */
      if (method === "UPI" && paymentSettings?.upiId) {
        setUpiPlaced(true);
        clearCart();
      }

    } catch (err) {
      console.error("Checkout Error:", err);
      alert(err.message || "Server error");
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1>Checkout</h1>

      <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      <textarea placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} style={{ ...inputStyle, height: 80 }} />
      <input placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value)} style={inputStyle} />

      <h2>Total ₹ {total}</h2>

      {/* ================= PAYMENT OPTIONS ================= */}
      {paymentSettings && !upiPlaced && (
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

          {paymentSettings.upi && (
            <label>
              <input type="radio" checked={method === "UPI"} onChange={() => setMethod("UPI")} />
              UPI QR
            </label>
          )}
        </div>
      )}

      {/* ================= UPI QR ================= */}
      {method === "UPI" && paymentSettings?.upiId && !upiPlaced && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <QRCode
            value={`upi://pay?pa=${paymentSettings.upiId}&pn=Store&am=${total}&cu=INR`}
          />
          <p>Scan & Pay. Admin will confirm your payment.</p>
        </div>
      )}

      {/* ================= UPI SUCCESS ================= */}
      {upiPlaced && (
        <div style={{ textAlign: "center", marginTop: 20, background: "#fef3c7", padding: 20, borderRadius: 6 }}>
          <h3>✅ Order Placed Successfully!</h3>
          <p>UPI payment pending confirmation.</p>
        </div>
      )}

      {/* ================= BUTTON ================= */}
      {!upiPlaced && (
        <button onClick={handleCheckout} disabled={loading} style={btnStyle}>
          {loading ? "Processing..." : "Continue"}
        </button>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  margin: "10px 0",
  border: "1px solid #ccc",
};

const btnStyle = {
  padding: 12,
  background: "#16a34a",
  color: "#fff",
  width: "100%",
  border: "none",
};
