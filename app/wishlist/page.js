"use client";

import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist() || {};
  const { addToCart } = useCart() || {};

  const items = wishlist || [];

  return (
    <div className="container">
      <h1>My Wishlist</h1>

      {items.length === 0 ? (
        <div className="empty">
          <p>Your wishlist is empty.</p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div className="card" key={item.productId}>
              <Link href={`/products/${item.slug}`}>
                <img src={item.image} alt={item.name} />
              </Link>

              <div className="body">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price}</p>

                <div className="actions">
                  <button
                    onClick={() =>
                      addToCart?.({
                        productId: item.productId,
                        productKey: item.productId,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        qty: 1,
                      })
                    }
                  >
                    Add to Cart
                  </button>

                  <button
                    className="remove"
                    onClick={() => removeFromWishlist(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 30px 20px;
        }

        .empty {
          text-align: center;
          padding: 60px 0;
        }

        .empty button {
          margin-top: 16px;
          padding: 12px 24px;
          border: none;
          border-radius: 30px;
          background: #c28b45;
          color: #fff;
          cursor: pointer;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .card {
          border: 1px solid #eee;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
        }

        .card img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .body {
          padding: 12px;
        }

        .price {
          font-weight: 700;
          color: #c28b45;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .actions button {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 8px;
          background: #222;
          color: #fff;
          cursor: pointer;
          font-size: 12px;
        }

        .remove {
          background: transparent !important;
          color: #d33 !important;
          border: 1px solid #d33 !important;
        }
      `}</style>
    </div>
  );
}
