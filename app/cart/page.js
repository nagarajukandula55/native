"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartTotal } = useCart();
  const router = useRouter();

  return (
    <div className="container">
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <div className="empty">
          <p>Your cart is empty</p>
          <Link href="/products" className="continueBtn">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.productId} className="row">

              <img src={item.image || "/placeholder.png"} />

              <div className="details">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price}</p>

                <div className="qtyRow">
                  <button
                    className="qtyBtn"
                    onClick={() =>
                      updateQty(item.productId, item.qty - 1)
                    }
                  >
                    -
                  </button>

                  <span className="qty">{item.qty}</span>

                  <button
                    className="qtyBtn"
                    onClick={() =>
                      updateQty(item.productId, item.qty + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  className="removeBtn"
                  onClick={() =>
                    removeFromCart(item.productId)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="totalRow">
            <h2>Total: ₹{cartTotal}</h2>
            <div className="actions">
              <Link href="/products" className="continueLink">
                Continue Shopping
              </Link>
              <button className="checkoutBtn" onClick={() => router.push("/checkout")}>
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: auto;
          padding: 30px 20px 60px;
        }

        .empty {
          color: #666;
          padding: 40px 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .continueBtn {
          display: inline-block;
          background: #1f3d2b;
          color: #fff;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
        }

        .row {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 18px;
          padding: 16px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .details h3 {
          margin: 0 0 4px;
          font-size: 16px;
        }

        .price {
          color: #1f3d2b;
          font-weight: 600;
          margin: 0 0 10px;
        }

        .qtyRow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .qtyBtn {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: #faf8f3;
          color: #1f3d2b;
          border-radius: 6px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          line-height: 1;
        }

        .qtyBtn:hover {
          background: #f0ead9;
          border-color: #c28b45;
        }

        .qty {
          min-width: 20px;
          text-align: center;
          font-weight: 600;
        }

        .removeBtn {
          background: none;
          border: none;
          color: #e11d48;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .removeBtn:hover {
          text-decoration: underline;
        }

        .totalRow {
          border-top: 1px solid #eee;
          padding-top: 16px;
          text-align: right;
        }

        .totalRow h2 {
          margin: 0 0 16px;
          color: #1f3d2b;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .continueLink {
          color: #1f3d2b;
          font-weight: 600;
          text-decoration: none;
          font-size: 14px;
        }

        .continueLink:hover {
          text-decoration: underline;
        }

        .checkoutBtn {
          background: #c28b45;
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
        }

        .checkoutBtn:hover {
          background: #a9762f;
        }
      `}</style>
    </div>
  );
}
