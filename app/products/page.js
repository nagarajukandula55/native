"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ================= ADD TO CART ================= */
  async function addToCart(product) {
    try {
      setAddingId(product.productKey);

      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          productKey: product.productKey,
          name: product.name,
          price: product.displayPrice,
          image: product.images?.[0],
          qty: 1,
        }),
      });

    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setAddingId(null);
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="container">
        <h1>All Products</h1>
        <div className="grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (!products.length) {
    return (
      <div className="container">
        <h1>All Products</h1>
        <p>No products available</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="container">
      <h1>All Products</h1>

      <div className="grid">
        {products.map((p) => {
          const price = p.displayPrice || 0;
          const mrp = p.mrp || 0;

          const discount =
            mrp && price
              ? Math.round(((mrp - price) / mrp) * 100)
              : 0;

          const rating = p.rating || 4.2; // fallback
          const isNew =
            new Date(p.createdAt) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

          return (
            <div key={p.productKey} className="card">

              {/* CLICKABLE AREA */}
              <Link href={`/products/${p.slug}`}>

                {/* IMAGE */}
                <div className="imgWrap">
                  <img
                    src={p.images?.[0] || "/no-image.png"}
                    loading="lazy"
                    alt={p.name}
                  />

                  {discount > 0 && (
                    <span className="badge red">{discount}% OFF</span>
                  )}

                  {isNew && (
                    <span className="badge green">NEW</span>
                  )}
                </div>

                {/* NAME */}
                <h3>{p.name}</h3>

                {/* RATING */}
                <div className="rating">
                  ⭐ {rating} <span>(120)</span>
                </div>

                {/* DESCRIPTION */}
                <p className="desc">
                  {p.shortDescription || "No description available"}
                </p>

                {/* PRICE */}
                <div className="price">
                  <span className="sell">₹{price}</span>
                  {mrp > price && (
                    <span className="mrp">₹{mrp}</span>
                  )}
                </div>

                {/* DELIVERY */}
                <div className="delivery">
                  🚚 Free Delivery
                </div>

              </Link>

              {/* ADD TO CART */}
              <button
                className="cartBtn"
                disabled={addingId === p.productKey}
                onClick={() => addToCart(p)}
              >
                {addingId === p.productKey
                  ? "Adding..."
                  : "Add to Cart"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 20px;
        }

        h1 {
          margin-bottom: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .card {
          border: 1px solid #eee;
          padding: 12px;
          border-radius: 12px;
          background: #fff;
          transition: 0.25s;
          display: flex;
          flex-direction: column;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }

        .imgWrap {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
        }

        img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: 0.3s;
        }

        .card:hover img {
          transform: scale(1.05);
        }

        .badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 8px;
          font-size: 11px;
          border-radius: 5px;
          color: #fff;
        }

        .red {
          background: #e53935;
        }

        .green {
          background: #2e7d32;
          left: auto;
          right: 10px;
        }

        h3 {
          margin: 8px 0 4px;
        }

        .rating {
          font-size: 13px;
          color: #444;
        }

        .rating span {
          color: #888;
        }

        .desc {
          font-size: 13px;
          color: #555;
          margin: 6px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price {
          margin-top: 5px;
        }

        .sell {
          font-weight: bold;
          font-size: 16px;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
          margin-left: 8px;
        }

        .delivery {
          font-size: 12px;
          color: green;
          margin-top: 4px;
        }

        .cartBtn {
          margin-top: auto;
          margin-top: 10px;
          padding: 10px;
          border: none;
          background: black;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
        }

        .cartBtn:hover {
          background: #333;
        }

        .cartBtn:disabled {
          background: #aaa;
          cursor: not-allowed;
        }

        .skeleton {
          height: 300px;
          background: linear-gradient(90deg,#eee,#f5f5f5,#eee);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
    </div>
  );
}
