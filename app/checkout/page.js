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

  const [orderCreated, setOrderCreated] = useState(false);
  const [upiOrderId, setUpiOrderId] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    fetch("/api/admin/payment-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPaymentSettings(data.settings);
      });
  }, []);

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

  const clearCart = () => {
    cart.forEach((item) => removeFromCart(item._id));
    closeCart();
  };

  /* ================= COD ================= */
  async function placeOrder() {
    if (!validate() || orderCreated) return;
    setLoading(true);
    setOrderCreated(true);

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
        clearCart();
        router.push(`/order-success?orderId=${data.orderId}`);
      } else {
        alert("Order failed");
        setOrderCreated(false);
      }
    } catch (err) {
      alert("Server error");
      setOrderCreated(false);
    }
    setLoading(false);
  }

  /* ================= UPI ================= */
  async function createUpiOrder() {
    if (!validate() || orderCreated) return;
    setLoading(true);
    setOrderCreated(true);

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
          paymentMethod: "UPI",
        }),
      });
      const data = await res.json();

      if (!data.success) {
        alert("Order creation failed");
        setOrderCreated(false);
        setLoading(false);
        return;
      }

      setUpiOrderId(data._id);

      // Start polling payment status
      const interval = setInterval(async () => {
        const statusRes = await fetch("/api/payment/upi-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data._id }),
        });
        const statusData = await statusRes.json();

        if (statusData.paymentStatus === "Paid") {
          clearInterval(interval);
          clearCart();
          router.push(`/order-success?orderId=${data.orderId}`);
        }
      }, 3000); // check every 3 seconds

    } catch (err) {
      alert("Server error");
      setOrderCreated(false);
    }

    setLoading(false);
  }

  const handleCheckout = () => {
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
        `https://wa.me/${paymentSettings.whatsappNumber}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );
      return;
    }
    if (method === "UPI") return createUpiOrder();
    // Razorpay logic can remain as before
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h1>Checkout</h1>

      <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <textarea placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ ...inputStyle, height: "80px" }} />
      <input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} style={inputStyle} />

      <h2>Total ₹ {total}</h2>

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
          {paymentSettings.upi && (
            <label>
              <input type="radio" checked={method === "UPI"} onChange={() => setMethod("UPI")} />
              UPI QR
            </label>
          )}
        </div>
      )}

      {method === "UPI" && paymentSettings?.upiId && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <QRCode value={`upi://pay?pa=${paymentSettings.upiId}&pn=Store&am=${total}&cu=INR`} />
          <p>Scan & Pay</p>
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
