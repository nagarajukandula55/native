"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const router = useRouter();

  const {
    cart,
    drawerOpen,
    closeCart,
    removeFromCart,
    updateQty,
    cartTotal,
    setCart,
  } = useCart();

  if (!drawerOpen) return null;

  /* ================= HANDLERS ================= */
  const handleCheckout = () => {
    closeCart(); // 🔥 IMPORTANT FIX

    setTimeout(() => {
      router.push("/checkout");
    }, 150); // smooth UX transition
  };

  return (
    <div className="overlay" onClick={closeCart}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="header">
          <h2>Your Cart</h2>

          <button className="closeBtn" onClick={closeCart}>
            ✕
          </button>
        </div>

        {/* CART ITEMS */}
        {cart.length === 0 ? (
          <p className="empty">Your cart is empty</p>
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

        {/* FOOTER */}
        <div className="footer">
          <h3>Total: ₹{cartTotal}</h3>

          <button onClick={handleCheckout} className="checkout">
            Checkout
          </button>

          <Link href="/cart">
            <button className="viewCart" onClick={closeCart}>
              View Cart
            </button>
          </Link>
        </div>

      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          justify-content: flex-end;
          z-index: 9999;
          animation: fadeIn 0.2s ease-in-out;
        }

        .drawer {
          width: 380px;
          background: white;
          height: 100%;
          padding: 20px;
          overflow-y: auto;
          animation: slideIn 0.25s ease-in-out;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .closeBtn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
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
          border-radius: 6px;
        }

        .qty button {
          padding: 2px 8px;
        }

        .remove {
          background: red;
          color: white;
          border: none;
          margin-top: 5px;
          padding: 5px;
        }

        .footer {
          margin-top: 20px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }

        .checkout {
          width: 100%;
          margin-top: 8px;
          padding: 10px;
          border: none;
          cursor: pointer;
          background: #c28b45;
          color: white;
        }

        .viewCart {
          width: 100%;
          margin-top: 8px;
          padding: 10px;
          border: none;
          cursor: pointer;
          background: #eee;
        }

        .empty {
          padding: 20px;
          text-align: center;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
