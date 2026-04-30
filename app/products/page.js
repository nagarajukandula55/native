"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductsPage() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleAddToCart(p) {
    setAddingId(p._id);

    addToCart({
      _id: p._id,
      productKey: p.productKey,
      name: p.name,
      price: p.displayPrice || 0,
      mrp: p.mrp || 0,
      image: p.images?.[0] || "/no-image.png",
      variant: "default",
      qty: 1,
    });

    setTimeout(() => setAddingId(null), 300);
  }

  if (loading) {
    return (
      <div className="container">
        <h2 className="title">All Products</h2>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">All Products</h1>

      <div className="grid">
        {products.map((p) => {
          const price = p.displayPrice || 0;
          const mrp = p.mrp || 0;
          const discount =
            mrp && price ? Math.round(((mrp - price) / mrp) * 100) : 0;

          return (
            <div key={p._id} className="card">

              {/* IMAGE */}
              <Link href={`/products/${p.slug}`} className="imageBox">
                <img
                  src={p.images?.[0] || "/no-image.png"}
                  alt={p.name}
                />

                {discount > 0 && (
                  <span className="badge">{discount}% OFF</span>
                )}
              </Link>

              {/* CONTENT */}
              <div className="content">
                <Link href={`/products/${p.slug}`} className="name">
                  {p.name}
                </Link>

                <div className="priceRow">
                  <span className="price">₹{price}</span>

                  {mrp > price && (
                    <span className="mrp">₹{mrp}</span>
                  )}
                </div>
              </div>

              {/* BUTTON */}
              <button
                className="btn"
                onClick={() => handleAddToCart(p)}
                disabled={addingId === p._id}
              >
                {addingId === p._id ? "Adding..." : "Add to Cart"}
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
          padding: 24px;
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 22px;
          color: #111;
        }

        /* GRID */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 20px;
        }

        /* CARD */
        .card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.25s ease;
          height: 100%;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        /* IMAGE FIX (MOST IMPORTANT FIX) */
        .imageBox {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1; /* 🔥 keeps perfect square */
          background: #f7f7f7;
          overflow: hidden;
          display: block;
        }

        .imageBox img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .card:hover .imageBox img {
          transform: scale(1.05);
        }

        /* DISCOUNT BADGE */
        .badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #e53935;
          color: white;
          font-size: 11px;
          padding: 4px 7px;
          border-radius: 6px;
          font-weight: 600;
        }

        /* CONTENT */
        .content {
          padding: 12px 14px 8px;
          flex: 1;
        }

        .name {
          font-size: 14px;
          font-weight: 600;
          color: #222;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-decoration: none;
        }

        /* PRICE ROW */
        .priceRow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .price {
          font-size: 16px;
          font-weight: 700;
          color: #111;
        }

        .mrp {
          font-size: 13px;
          color: #888;
          text-decoration: line-through;
        }

        /* BUTTON */
        .btn {
          margin: 10px 12px 12px;
          padding: 10px;
          border: none;
          border-radius: 10px;
          background: #111;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn:hover {
          background: #000;
        }

        .btn:disabled {
          background: #aaa;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
