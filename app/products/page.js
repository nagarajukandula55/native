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

  /* ================= ADD TO CART ================= */
  function handleAddToCart(p) {
    try {
      const id = p.mongoId || p._id;
      if (!id) return;

      setAddingId(id);

      const item = {
        _id: id,
        productId: id,
        productKey: p.productKey || id,
        name: p.name || "Product",
        price: Number(p.displayPrice || 0),
        mrp: Number(p.mrp || 0),
        image: p.images?.[0] || "/no-image.png",
        variant: "default",
        qty: 1,
      };

      addToCart(item);
    } finally {
      setTimeout(() => setAddingId(null), 200);
    }
  }

  /* ================= SHARE ================= */
  function handleShare(p) {
    const url = `${window.location.origin}/products/${p.slug}`;

    const text = `🛍️ ${p.name}\n₹${p.displayPrice || 0}\n\n${url}`;

    if (navigator.share) {
      navigator.share({
        title: p.name,
        text,
        url,
      });
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="container">
        <h2>All Products</h2>
        <p>Loading...</p>
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (!products.length) {
    return (
      <div className="container">
        <h2>All Products</h2>
        <p>No products available</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="container">
      <h2>All Products</h2>

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

              <Link href={`/products/${p.slug}`} className="link">
                <div className="imgWrap">
                  <img src={p.images?.[0] || "/no-image.png"} />
                  {discount > 0 && (
                    <span className="badge">{discount}% OFF</span>
                  )}
                </div>

                <div className="content">
                  <h3>{p.name}</h3>
                  <p className="price">
                    <b>₹{price}</b>{" "}
                    {mrp > price && <span className="mrp">₹{mrp}</span>}
                  </p>
                </div>
              </Link>

              <div className="actions">
                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={addingId === p._id}
                  className="btn"
                >
                  {addingId === p._id ? "Adding..." : "Add to Cart"}
                </button>

                <button onClick={() => handleShare(p)} className="share">
                  Share
                </button>
              </div>
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
        }

        .imgWrap img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .badge {
          position: absolute;
          margin: 10px;
          background: red;
          color: #fff;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 5px;
        }

        .content {
          padding: 12px;
        }

        .price {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
        }

        .actions {
          display: flex;
          gap: 10px;
          padding: 10px;
        }

        .btn {
          flex: 1;
          padding: 10px;
          background: black;
          color: white;
          border: none;
          border-radius: 8px;
        }

        .btn:disabled {
          background: #aaa;
        }

        .share {
          padding: 10px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
