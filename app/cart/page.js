"use client";

import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartTotal,
  } = useCart();

  const router = useRouter();

  const generateWhatsAppLink = () => {
    const message = `
Hello Native Team,

I would like to place an order:

${cart
  .map(
    (item) =>
      `• ${item.name} - ₹${item.price} x ${item.quantity} = ₹${
        item.price * item.quantity
      }`
  )
  .join("\n")}

Total: ₹${cartTotal}

Please assist with the payment process.
    `;

    return `https://wa.me/919000528462?text=${encodeURIComponent(
      message
    )}`;
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
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                marginBottom: "20px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <h3>{item.name}</h3>

              <p>Price: ₹{item.price}</p>

              {/* Quantity Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => decreaseQuantity(item.id)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  −
                </button>

                <span style={{ fontSize: "16px", minWidth: "20px", textAlign: "center" }}>
                  {item.quantity}
                </span>

                <button
                  onClick={() => increaseQuantity(item.id)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>

              <p style={{ marginTop: "10px" }}>
                Item Total: ₹{item.price * item.quantity}
              </p>

              <button
                onClick={() => removeFromCart(item.id)}
                style={{
                  marginTop: "10px",
                  padding: "6px 12px",
                  backgroundColor: "#b02a37",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}

          <h2 style={{ marginTop: "30px" }}>Total: ₹{cartTotal}</h2>

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={clearCart}
              style={{
                padding: "8px 20px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5",
                cursor: "pointer",
              }}
            >
              Clear Cart
            </button>
          </div>

          <div style={{ marginTop: "40px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/checkout")}
              style={{
                padding: "12px 30px",
                borderRadius: "25px",
                border: "none",
                backgroundColor: "#c28b45",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Proceed to Checkout
            </button>

            <a
              href={generateWhatsAppLink()}
              target="_blank"
              style={{
                padding: "12px 30px",
                borderRadius: "25px",
                textDecoration: "none",
                backgroundColor: "#25D366",
                color: "#fff",
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
