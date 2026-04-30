"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

          return (
            <Link
              key={p.productKey}
              href={`/products/${p.slug}`}
              className="card"
            >
              {/* IMAGE */}
              <div className="imgWrap">
                <img
                  src={p.images?.[0] || "/no-image.png"}
                  loading="lazy"
                  alt={p.name}
                />
                {discount > 0 && (
                  <span className="badge">{discount}% OFF</span>
                )}
              </div>

              {/* NAME */}
              <h3>{p.name}</h3>

              {/* PRICE */}
              <div className="price">
                <span className="sell">₹{price}</span>
                {mrp > price && (
                  <span className="mrp">₹{mrp}</span>
                )}
              </div>

              {/* OPTIONAL DEBUG */}
              <small style={{ color: "#999" }}>
                {p.productKey}
              </small>
            </Link>
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
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .card {
          border: 1px solid #eee;
          padding: 12px;
          border-radius: 10px;
          transition: 0.2s;
          background: #fff;
          text-decoration: none;
          color: inherit;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .imgWrap {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
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
          background: #e53935;
          color: #fff;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 5px;
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

        .skeleton {
          height: 280px;
          background: linear-gradient(90deg, #eee, #f5f5f5, #eee);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: 200px 0;
          }
        }
      `}</style>
    </div>
  );
}
