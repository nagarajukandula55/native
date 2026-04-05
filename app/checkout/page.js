"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCheckout() {
    if (!cart.length) return alert("Cart empty");

    setLoading(true);

    try {
      const items = cart.map((i) => ({
        productId: i._id,
        name: i.name,
        quantity: Number(i.quantity),
        price: Number(i.price),
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          pincode: form.pincode,
          items,
          paymentMethod: "COD",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      const orderId = data.order?.orderId;

      clearCart();

      router.push(`/order-success?orderId=${orderId}`);

    } catch (err) {
      alert("Checkout failed");
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h1>Checkout</h1>

      {["name", "phone", "email", "address", "pincode"].map((f) => (
        <input
          key={f}
          name={f}
          placeholder={f}
          onChange={handleChange}
          style={{ width: "100%", margin: 10, padding: 10 }}
        />
      ))}

      <h3>Total ₹{total}</h3>

      <button onClick={handleCheckout} disabled={loading}>
        {loading ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
}
