"use client";

import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();

  return (
    <div className="container">
      <h1>Checkout</h1>

      <p>Items: {cart.length}</p>
      <h2>Total: ₹{cartTotal}</h2>

      <button className="payBtn">
        Place Order (Coming Soon)
      </button>

      <style jsx>{`
        .container {
          max-width: 700px;
          margin: auto;
          padding: 30px;
        }

        .payBtn {
          width: 100%;
          padding: 12px;
          background: #c28b45;
          color: white;
          border: none;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
