"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartDrawer() {
  const router = useRouter();

  const {
    cart,
    drawerOpen,
    closeCart,
    removeFromCart,
    updateQty,
    cartTotal,
  } = useCart();

  if (!drawerOpen) return null;

  const handleCheckout = () => {
    closeCart();
    setTimeout(() => router.push("/checkout"), 150);
  };

  return (
    <div className="overlay" onClick={closeCart}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="header">
          <div>
            <h2>Your Cart</h2>
            <p>{cart.length} item(s)</p>
          </div>

          <button className="closeBtn" onClick={closeCart}>✕</button>
        </div>

        {/* EMPTY STATE */}
        {cart.length === 0 ? (
          <div className="empty">
            <div className="emoji">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to continue</p>

            <button className="shopBtn" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* ITEMS */}
            <div className="items">
              {cart.map((item) => (
                <div className="item" key={item._id}>

                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                  />

                  <div className="info">
                    <h4>{item.name}</h4>

                    <p className="price">₹{item.price}</p>

                    {/* QUANTITY CONTROLS */}
                    <div className="qty">
                      <button onClick={() => updateQty(item._id, item.qty - 1)}>
                        −
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
              ))}
            </div>

            {/* STICKY FOOTER */}
            <div className="footer">
              <div className="totalRow">
                <span>Total</span>
                <strong>₹{cartTotal}</strong>
              </div>

              <button className="checkout" onClick={handleCheckout}>
                Proceed to Checkout →
              </button>

              <Link href="/cart">
                <button className="viewCart" onClick={closeCart}>
                  View Full Cart
                </button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
          z-index: 9999;
          animation: fade 0.2s ease-in-out;
        }

        .drawer {
          width: 420px;
          max-width: 100%;
          height: 100%;
          background: #fff;
          display: flex;
          flex-direction: column;
          animation: slide 0.25s ease-out;
          box-shadow: -10px 0 30px rgba(0,0,0,0.15);
        }

        /* HEADER */
        .header {
          padding: 18px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header h2 {
          margin: 0;
          font-size: 18px;
        }

        .header p {
          margin: 0;
          font-size: 12px;
          color: #777;
        }

        .closeBtn {
          border: none;
          background: #f5f5f5;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
        }

        /* ITEMS */
        .items {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          transition: 0.2s;
        }

        .item:hover {
          background: #fafafa;
          transform: scale(1.01);
        }

        .item img {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: 10px;
        }

        .info {
          flex: 1;
        }

        .info h4 {
          margin: 0;
          font-size: 14px;
        }

        .price {
          color: #c28b45;
          font-weight: 600;
          margin: 4px 0;
        }

        /* QTY */
        .qty {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 6px 0;
        }

        .qty button {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          transition: 0.2s;
        }

        .qty button:hover {
          background: #f3f3f3;
        }

        .remove {
          border: none;
          background: transparent;
          color: #ef4444;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
        }

        /* EMPTY STATE */
        .empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }

        .emoji {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .shopBtn {
          margin-top: 15px;
          padding: 10px 16px;
          border: none;
          background: #c28b45;
          color: white;
          border-radius: 8px;
          cursor: pointer;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid #eee;
          padding: 16px;
          background: #fff;
        }

        .totalRow {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .checkout {
          width: 100%;
          padding: 12px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }

        .checkout:hover {
          background: #a86e2f;
        }

        .viewCart {
          width: 100%;
          margin-top: 8px;
          padding: 10px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 10px;
          cursor: pointer;
        }

        /* ANIMATIONS */
        @keyframes slide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
