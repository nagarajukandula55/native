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

  // MUST be after hooks
  if (!drawerOpen) return null;

  const handleCheckout = () => {
    closeCart();
    setTimeout(() => router.push("/checkout"), 150);
  };

  return (
    <div className="overlay" onClick={closeCart}>
      <div
        className="drawer"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="header">
          <div>
            <h2>Your Cart</h2>
            <p>{cart?.length || 0} item(s)</p>
          </div>

          <button
            type="button"
            className="closeBtn"
            onClick={closeCart}
          >
            ✕
          </button>
        </div>

        {/* EMPTY STATE */}
        {(!cart || cart.length === 0) ? (
          <div className="empty">
            <div className="emoji">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to continue shopping</p>

            <button
              className="shopBtn"
              onClick={closeCart}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* ITEMS */}
            <div className="items">
              {cart.map((item) => (
                <div
                  className="item"
                  key={item.productId}
                >
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                  />

                  <div className="info">
                    <h4>{item.name}</h4>

                    <p className="price">
                      ₹{item.price}
                    </p>

                    {/* QTY CONTROLS */}
                    <div className="qty">
                      <button
                        onClick={() =>
                          updateQty(
                            item.productId,
                            item.qty - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() =>
                          updateQty(
                            item.productId,
                            item.qty + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove"
                      onClick={() =>
                        removeFromCart(item.productId)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="footer">
              <div className="totalRow">
                <span>Total</span>
                <strong>₹{cartTotal}</strong>
              </div>

              <button
                className="checkout"
                onClick={handleCheckout}
              >
                Proceed to Checkout →
              </button>

              <Link href="/cart">
                <button
                  className="viewCart"
                  onClick={closeCart}
                >
                  View Full Cart
                </button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* STYLES */}
      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
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
          box-shadow: -10px 0 30px rgba(0,0,0,0.15);
        }

        .header {
          padding: 18px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .closeBtn {
          border: none;
          background: #f5f5f5;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
        }

        .items {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .item {
          display: flex;
          gap: 12px;
          padding: 12px;
        }

        .item img {
          width: 72px;
          height: 72px;
          object-fit: cover;
        }

        .qty button {
          width: 26px;
          height: 26px;
        }

        .footer {
          padding: 16px;
          border-top: 1px solid #eee;
        }

        .checkout {
          width: 100%;
          padding: 12px;
          background: #c28b45;
          color: white;
          border: none;
        }
      `}</style>
    </div>
  );
}
