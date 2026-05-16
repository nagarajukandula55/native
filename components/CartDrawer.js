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
    setTimeout(() => router.push("/checkout"), 120);
  };

  return (
    <div className="overlay" onClick={closeCart}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>

        {/* HEADER (sticky) */}
        <div className="header">
          <div>
            <h2>Shopping Cart</h2>
            <p>{cart?.length || 0} items</p>
          </div>

          <button className="closeBtn" onClick={closeCart}>
            ✕
          </button>
        </div>

        {/* BODY */}
        {(!cart || cart.length === 0) ? (
          <div className="empty">
            <div className="icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add products to continue shopping</p>

            <button className="shopBtn" onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="body">
            {cart.map((item) => (
              <div className="card" key={item.productId}>

                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                />

                <div className="content">
                  <div className="top">
                    <h4>{item.name}</h4>
                    <span className="price">₹{item.price}</span>
                  </div>

                  <div className="bottom">
                    <div className="qty">
                      <button
                        onClick={() =>
                          updateQty(item.productId, item.qty - 1)
                        }
                      >
                        −
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() =>
                          updateQty(item.productId, item.qty + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER (sticky) */}
        {cart?.length > 0 && (
          <div className="footer">
            <div className="total">
              <span>Total</span>
              <strong>₹{cartTotal}</strong>
            </div>

            <button className="checkout" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>

            <Link href="/cart">
              <button className="secondary" onClick={closeCart}>
                View Full Cart
              </button>
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: flex-end;
          z-index: 9999;
        }

        .drawer {
          width: 420px;
          max-width: 100%;
          height: 100%;
          background: #fff;
          display: flex;
          flex-direction: column;
          animation: slide 0.25s ease;
        }

        /* HEADER */
        .header {
          position: sticky;
          top: 0;
          background: white;
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
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #f2f2f2;
          cursor: pointer;
          font-size: 16px;
        }

        /* BODY */
        .body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ITEM CARD */
        .card {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid #f0f0f0;
          transition: 0.2s;
        }

        .card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .card img {
          width: 64px;
          height: 64px;
          border-radius: 10px;
          object-fit: cover;
        }

        .content {
          flex: 1;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        .top h4 {
          margin: 0;
          font-size: 14px;
        }

        .price {
          font-weight: 600;
          color: #c28b45;
        }

        .bottom {
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* QTY */
        .qty {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 2px 8px;
        }

        .qty button {
          border: none;
          background: transparent;
          font-size: 16px;
          cursor: pointer;
        }

        .remove {
          border: none;
          background: transparent;
          color: #ef4444;
          font-size: 12px;
          cursor: pointer;
        }

        /* EMPTY */
        .empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }

        .icon {
          font-size: 44px;
          margin-bottom: 10px;
        }

        .shopBtn {
          margin-top: 14px;
          padding: 10px 16px;
          border: none;
          background: #c28b45;
          color: white;
          border-radius: 10px;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid #eee;
          padding: 16px;
          background: #fff;
        }

        .total {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .checkout {
          width: 100%;
          padding: 12px;
          background: #c28b45;
          color: white;
          border: none;
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .secondary {
          width: 100%;
          padding: 10px;
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 10px;
        }

        @keyframes slide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
