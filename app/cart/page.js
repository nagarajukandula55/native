"use client";

import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const generateWhatsAppLink = () => {
    const message = `
Hello Native Team,

I would like to place an order:

${cart
  .map((item) => `• ${item.name} - ₹${item.price}`)
  .join("\n")}

Total: ₹${total}

Please assist with the payment process.
    `;

    return `https://wa.me/919000528462?text=${encodeURIComponent(message)}`;
  };

  return (
    <div style={{ padding: "80px 60px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "40px", marginBottom: "40px" }}>
        Your Cart
      </h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
            </div>
          ))}

          <h2 style={{ marginTop: "30px" }}>Total: ₹{total}</h2>

          <div style={{ marginTop: "40px", display: "flex", gap: "20px" }}>
            {/* Future Payment Button */}
            <button
              style={{
                padding: "12px 30px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: "#c28b45",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Proceed to Payment
            </button>

            {/* WhatsApp Button */}
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              style={{
                padding: "12px 30px",
                borderRadius: "25px",
                textDecoration: "none",
                backgroundColor: "#25D366",
                color: "#fff",
                display: "inline-block",
              }}
            >
              Order via WhatsApp
            </a>
          </div>
        </>
      )}
    </div>
  );
}
