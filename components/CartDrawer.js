"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartDrawer() {
  const {
    cart,
    drawerOpen,
    setDrawerOpen,
    removeFromCart,
    updateQty,
    cartTotal,
  } = useCart();

  if (!drawerOpen) return null;

  return (
    <div className="overlay" onClick={() => setDrawerOpen(false)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>

        <h2>Your Cart</h2>

        {cart.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          cart.map((item) => (
            <div key={item._id} className="item">

              <img src={item.image || "/placeholder.png"} />

              <div className="info">
                <h4>{item.name}</h4>
                <p>₹{item.price}</p>

                <div className="qty">
                  <button onClick={() => updateQty(item._id, item.qty - 1)}>
                    -
                  </button>

                  <span>{item.qty}</span>

                  <button onClick={() => updateQty(item._id, item.qty + 1)}>
                    +
                  </button>
                </div>

                <button
                  className="remove"
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}

        <div className="footer">
          <h3>Total: ₹{cartTotal}</h3>

          <Link href="/cart">
            <button>Go to Cart</button>
          </Link>

          <Link href="/checkout">
            <button className="checkout">Checkout</button>
          </Link>
        </div>

      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: flex-end;
          z-index: 999;
        }

        .drawer {
          width: 380px;
          background: white;
          height: 100%;
          padding: 20px;
          overflow-y: auto;
        }

        .item {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        img {
          width: 70px;
          height: 70px;
          object-fit: cover;
        }

        .qty button {
          padding: 2px 8px;
        }

        .remove {
          background: red;
          color: white;
          border: none;
          margin-top: 5px;
        }

        .footer {
          margin-top: 20px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }

        button {
          width: 100%;
          margin-top: 8px;
          padding: 10px;
          border: none;
          cursor: pointer;
        }

        .checkout {
          background: #c28b45;
          color: white;
        }
      `}</style>
    </div>
  );
}
