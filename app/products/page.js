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

    } catch (err) {
      console.error(err);
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

          return (
            <div key={p.productKey} className="card">

              {/* LINK AREA */}
              <Link href={`/products/${p.slug}`} className="link">

                <div className="imgWrap">
                  <img
                    src={p.images?.[0] || "/no-image.png"}
                    alt={p.name}
                  />

                  {discount > 0 && (
                    <span className="badge">{discount}% OFF</span>
                  )}
                </div>

                <div className="content">
                  <h3>{p.name}</h3>

                  {p.shortDescription && (
                    <p className="desc">{p.shortDescription}</p>
                  )}

                  <div className="price">
                    <span className="sell">₹{price}</span>
                    {mrp > price && (
                      <span className="mrp">₹{mrp}</span>
                    )}
                  </div>
                </div>
              </Link>

              {/* ADD TO CART */}
              <button
                className="cartBtn"
                disabled={addingId === p.productKey}
                onClick={() => handleAddToCart(p)}
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

        .imgWrap {
          position: relative;
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

        .desc {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price {
          display: flex;
          gap: 8px;
        }

        .sell {
          font-weight: bold;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
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
      `}</style>
    </div>
  );
}
