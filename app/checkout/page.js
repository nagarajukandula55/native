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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    fetch("/api/admin/payment-settings")
      .then(res => res.json())
      .then(data => { if (data.success) setPaymentSettings(data.settings); });
  }, []);

  const validate = () => {
    if (cart.length === 0) { alert("Cart is empty"); return false; }
    if (!name || !phone || !address || !pincode) { alert("Please fill all fields"); return false; }
    return true;
  };

  const clearCart = () => {
    cart.forEach(item => removeFromCart(item._id));
    closeCart();
  };

  /* ================== HANDLE CHECKOUT ================== */
  async function handleCheckout() {
    if (!validate()) return;

    setLoading(true);

    try {
      const body = {
        customerName: name,
        phone,
        email,
        address,
        pincode,
        items: cart,
        paymentMethod: method
      };

      /* ================== CREATE ORDER ================== */
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) {
        alert("Order creation failed");
        setLoading(false);
        return;
      }

      /* ================== HANDLE PAYMENT METHODS ================== */
      if (method === "COD" || method === "WHATSAPP") {
        clearCart();
        router.push(`/order-success?orderId=${data.orderId}`);
      }

      /* ================== UPI ================== */
      if (method === "UPI" && paymentSettings?.upiId) {
        alert("Scan the QR code and pay. Your order will be confirmed by admin.");
        clearCart();
        router.push(`/order-success?orderId=${data.orderId}`);
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
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

      {paymentSettings && (
        <div style={{ margin: "20px 0" }}>
          <h3>Select Payment Method</h3>
          {paymentSettings.cod && <label><input type="radio" checked={method === "COD"} onChange={() => setMethod("COD")} /> COD</label>}
          {paymentSettings.whatsapp && <label><input type="radio" checked={method === "WHATSAPP"} onChange={() => setMethod("WHATSAPP")} /> WhatsApp</label>}
          {paymentSettings.upi && <label><input type="radio" checked={method === "UPI"} onChange={() => setMethod("UPI")} /> UPI QR</label>}
        </div>
      )}

      {method === "UPI" && paymentSettings?.upiId && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <QRCode value={`upi://pay?pa=${paymentSettings.upiId}&pn=Store&am=${total}&cu=INR`} />
          <p>Scan & Pay. Admin will confirm your payment.</p>
        </div>
      )}

      <button onClick={handleCheckout} disabled={loading} style={btnStyle}>
        {loading ? "Processing..." : "Continue"}
      </button>
    </div>
  );
}

const inputStyle = { width: "100%", padding: 10, margin: "10px 0", border: "1px solid #ccc" };
const btnStyle = { padding: 12, background: "#16a34a", color: "#fff", width: "100%", border: "none" };
