"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext"; // ✅ IMPORTANT

export default function ProductsPage() {
  const { addToCart } = useCart(); // ✅ USE CONTEXT

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
  
        const id = p.mongoId || p._id;
        if (!id) return;
  
        setAddingId(id);
  
        const item = {
          _id: id,                     // ✅ unified key (VERY IMPORTANT)
          productId: p.mongoId || p._id,
          productKey: p.productKey || id,
          _id: p.productKey,
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

/* ============ Share ============= */

function handleShare(p) {
  try {
    const url = `${window.location.origin}/products/${p.slug}`;

    const text = `🛍️ ${p.name}\n₹${p.displayPrice || 0}\n\n${url}`;

    if (navigator.share) {
      navigator.share({
        title: p.name,
        text,
        url,
      });
      return;
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );

  } catch (e) {
    console.error(e);
  }
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
          <div key={p._id} className="card">

            <Link href={`/products/${p.slug}`}>
              <div className="imgWrap">
                <img src={p.images?.[0]} alt={p.name} />
                {discount > 0 && (
                  <span className="badge">{discount}% OFF</span>
                )}
              </div>

              <div className="content">
                <h3>{p.name}</h3>
                <div className="price">
                  <span className="sell">₹{price}</span>
                  {mrp > price && <span className="mrp">₹{mrp}</span>}
                </div>
              </div>
            </Link>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 8, margin: 10 }}>
              <button
                className="cartBtn"
                style={{ flex: 1 }}
                disabled={addingId === p._id}
                onClick={() => handleAddToCart(p)}
              >
                {addingId === p._id ? "Adding..." : "Add to Cart"}
              </button>

              <button
                onClick={() => handleShare(p)}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                📤
              </button>
            </div>

          </div>
        );
      })}
    </div>

    {/* 👇 IMPORTANT: styles OUTSIDE map and OUTSIDE buttons */}
    <style jsx>{`
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 20px;
      }

      .card {
        background: #fff;
        border-radius: 12px;
        border: 1px solid #eee;
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
        background: red;
        color: #fff;
        padding: 4px 8px;
        font-size: 12px;
      }
    `}</style>

  </div>
);
