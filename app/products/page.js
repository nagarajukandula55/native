"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function addToCart(p) {
    try {
      setAddingId(p.productKey);

      await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productKey: p.productKey,
          name: p.name,
          price: p.displayPrice,
          image: p.images?.[0],
          qty: 1,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  }

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

  if (!products.length) {
    return (
      <div className="container">
        <h1>All Products</h1>
        <p>No products available</p>
      </div>
    );
  }

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
            <div key={p.productKey} className="card">

              <Link href={`/products/${p.slug}`} className="link">

                {/* IMAGE */}
                <div className="imgWrap">
                  <img
                    src={p.images?.[0] || "/no-image.png"}
                    alt={p.name}
                  />

                  {discount > 0 && (
                    <span className="badge">{discount}% OFF</span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="content">

                  <h3>{p.name}</h3>

                  {/* DESCRIPTION */}
                  {p.shortDescription && (
                    <p className="desc">{p.shortDescription}</p>
                  )}

                  {/* PRICE */}
                  <div className="price">
                    <span className="sell">₹{price}</span>
                    {mrp > price && (
                      <span className="mrp">₹{mrp}</span>
                    )}
                  </div>

                </div>
              </Link>

              {/* ACTION */}
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
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #eee;
          display: flex;
          flex-direction: column;
          transition: 0.25s;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }

        .link {
          text-decoration: none;
          color: inherit;
        }

        .imgWrap {
          position: relative;
          overflow: hidden;
        }

        img {
          width: 100%;
          height: 200px;
          object-fit: cover;
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

        .content {
          padding: 12px;
        }

        h3 {
          font-size: 16px;
          margin-bottom: 5px;
        }

        .desc {
          font-size: 13px;
          color: #666;
          line-height: 1.4;
          margin-bottom: 8px;

          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sell {
          font-size: 16px;
          font-weight: bold;
        }

        .mrp {
          font-size: 13px;
          color: #888;
          text-decoration: line-through;
        }

        .cartBtn {
          margin: 10px;
          padding: 10px;
          border: none;
          background: black;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .cartBtn:disabled {
          background: #aaa;
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
