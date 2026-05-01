"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await res.json();
        const list = data?.products || [];

        setProducts(list);
      } catch (err) {
        console.error("Product fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="home">

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="overlay" />

        <div className="scrollText">
          <div>We are adding new products to our catalogue ✨</div>
        </div>

        <div className="heroContent">
          <h1>Welcome to Native</h1>
          <p className="tagline">Eat Healthy, Stay Healthy</p>
          <p className="desc">
            Authentic natural food products refined directly from the source.
          </p>

          <button
            onClick={() =>
              document.getElementById("products").scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Explore Products
          </button>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="section">
        <h2>Our Categories</h2>

        <div className="grid">
          {["Batter Mix", "Cold Pressed Oils", "Traditional Foods", "Natural Products"].map(
            (cat) => (
              <div key={cat} className="card">
                {cat}
              </div>
            )
          )}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section id="products" className="section">
        <h2>Featured Products</h2>

        {loading ? (
          <p className="center">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="center">No products found</p>
        ) : (
          <div className="productGrid">
            {products.map((p) => {
              const price = p.displayPrice || p.minPrice || 0;
              const mrp = p.mrp || 0;

              const discount =
                mrp > 0
                  ? Math.round(((mrp - price) / mrp) * 100)
                  : 0;

              return (
                <div key={p._id} className="productCard">

                  {/* IMAGE */}
                  <img
                    src={p.images?.[0] || "/placeholder.png"}
                    alt={p.name}
                  />

                  <div className="productBody">

                    {/* NAME */}
                    <h3>{p.name}</h3>

                    {/* DESCRIPTION */}
                    <p className="desc">
                      {p.shortDescription ||
                        p.description ||
                        "No description available"}
                    </p>

                    {/* PRICE */}
                    <div className="priceBox">
                      <span className="price">₹{price}</span>

                      {mrp > price && (
                        <>
                          <span className="mrp">₹{mrp}</span>
                          <span className="off">{discount}% OFF</span>
                        </>
                      )}
                    </div>

                    {/* ✅ FIXED ADD TO CART */}
                    <button
                      onClick={() =>
                        addToCart({
                          productId: p._id,          // ✅ CRITICAL FIX
                          productKey: p.productKey,  // ✅ CRITICAL FIX
                          name: p.name,
                          price,
                          image: p.images?.[0],
                          qty: 1,                    // ✅ REQUIRED
                          hsn: p.hsn,                // ✅ fallback safety
                          gstPercent: p.tax          // ✅ fallback safety
                        })
                      }
                    >
                      Add to Cart
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= WHY US ================= */}
      <section className="why">
        <h2>Why Choose Native</h2>

        <div className="grid">
          {[
            ["🌿", "100% Natural"],
            ["🚜", "Direct From Farmers"],
            ["🧂", "Traditional Methods"],
            ["❤️", "Healthy Lifestyle"],
          ].map(([icon, text]) => (
            <div key={text} className="card">
              <div className="icon">{icon}</div>
              <strong>{text}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STYLES ================= */}
      <style jsx>{`
        .home {
          font-family: system-ui;
        }

        .hero {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: url('/hero.png') center/cover;
          color: white;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
        }

        .heroContent {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }

        h1 {
          font-size: 64px;
          margin: 0;
        }

        .tagline {
          font-size: 22px;
        }

        .desc {
          margin: 20px 0;
        }

        button {
          padding: 12px 30px;
          background: #c28b45;
          border: none;
          color: white;
          border-radius: 30px;
          cursor: pointer;
        }

        .scrollText {
          position: absolute;
          top: 20px;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
        }

        .scrollText div {
          display: inline-block;
          padding-left: 100%;
          animation: scroll 12s linear infinite;
        }

        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }

        .section {
          padding: 70px 20px;
          max-width: 1200px;
          margin: auto;
          text-align: center;
        }

        h2 {
          font-size: 32px;
          margin-bottom: 30px;
        }

        .center {
          text-align: center;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        .productGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 25px;
        }

        .productCard {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          height: 100%;
        }

        .productCard img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .productBody {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 15px;
        }

        .productBody h3 {
          margin: 0;
          font-size: 16px;
        }

        .productBody .desc {
          font-size: 13px;
          color: #666;
          flex-grow: 1;
          min-height: 40px;
        }

        .priceBox {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .price {
          font-weight: bold;
          font-size: 18px;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
        }

        .off {
          color: green;
          font-weight: bold;
        }

        .productBody button {
          width: 100%;
          margin-top: auto;
        }

        .why {
          background: #f4efe6;
          padding: 70px 20px;
          text-align: center;
        }

        .icon {
          font-size: 40px;
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 36px;
          }

          .productGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .productGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
