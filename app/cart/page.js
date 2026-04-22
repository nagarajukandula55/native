"use client";

import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartTotal } = useCart();

  return (
    <div className="container">
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        cart.map((item) => (
          <div key={item._id} className="row">

            <img src={item.image || "/placeholder.png"} />

            <div>
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>

              <div>
                <button onClick={() => updateQty(item._id, item.qty - 1)}>
                  -
                </button>

                <span>{item.qty}</span>

                <button onClick={() => updateQty(item._id, item.qty + 1)}>
                  +
                </button>
              </div>

              <button onClick={() => removeFromCart(item._id)}>
                Remove
              </button>
            </div>
          </div>
        ))
      )}

      <h2>Total: ₹{cartTotal}</h2>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: auto;
          padding: 30px;
        }

        .row {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }

        img {
          width: 100px;
          height: 100px;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
