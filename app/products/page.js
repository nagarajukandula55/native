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

  /* ================= ADD TO CART (FIXED SAFE VERSION) ================= */
  function handleAddToCart(p) {
    try {
      if (!p) return;

      const id = p._id || p.productKey;
      if (!id) return;

      setAddingId(id);

      const item = {
        _id: id,                     // ✅ unified key (VERY IMPORTANT)
        productKey: p.productKey || id,
        name: p.name || "Product",
        price: Number(p.displayPrice || 0),
        mrp: Number(p.mrp || 0),
        image: p.images?.[0] || "/no-image.png",
        variant: "default",
        qty: 1,
      };

      console.log("ADD TO CART SAFE:", item);

      addToCart(item);
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setTimeout(() => setAddingId(null), 200);
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="container">
        <h1>All Products</h1>
        <p>Loading products...</p>
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
      <h1 className="title">All Products</h1>

      <div className="grid">
        {products.map((p) => {
          const id = p._id || p.productKey;
          const price = Number(p.displayPrice || 0);
          const mrp = Number(p.mrp || 0);

          const discount =
            mrp && price ? Math.round(((mrp - price) / mrp) * 100) : 0;

          return (
            <div key={id} className="card">

              {/* IMAGE */}
              <Link href={`/products/${p.slug}`} className="imageWrap">
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
                <Link href={`/products/${p.slug}`}>
                  <h3 className="name">{p.name}</h3>
                </Link>

                <p className="price">
                  ₹{price}
                  {mrp > price && (
                    <span className="mrp">₹{mrp}</span>
                  )}
                </p>
              </div>

              {/* BUTTON */}
              <button
                className="btn"
                onClick={() => handleAddToCart(p)}
                disabled={addingId === id}
              >
                {addingId === id ? "Adding..." : "Add to Cart"}
              </button>

            </div>
          );
        })}
      </div>

      {/* ================= STYLES (YOUR ORIGINAL CLEAN UI + SAFE FIXES) ================= */}
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 25px;
        }

        .title {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
        }

        .card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: 0.25s;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }

        .imageWrap {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
          display: block;
        }

        .imageWrap img {
          width: 100%;
          height: 100%;
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
          color: white;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 5px;
        }

        .content {
          padding: 12px 14px;
          flex-grow: 1;
        }

        .name {
          font-size: 15px;
          font-weight: 600;
          color: #222;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price {
          font-size: 16px;
          font-weight: 700;
        }

        .mrp {
          margin-left: 8px;
          font-size: 13px;
          color: #888;
          text-decoration: line-through;
          font-weight: 400;
        }

        .btn {
          margin: 10px 14px 14px;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: #111;
          color: white;
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
