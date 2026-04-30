"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { addToCart } = useCart();
  const router = useRouter();

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

        // ✅ IMPORTANT FILTER
        const filtered = list.filter(
          (p) => p.status === "approved" && p.isListed === true
        );

        setProducts(filtered);
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
              const price =
                p.primaryVariant?.sellingPrice || p.sellingPrice || 0;

              const mrp =
                p.primaryVariant?.mrp || p.mrp || 0;

              const image =
                p.images?.[0] || "/placeholder.png";

              const discount =
                mrp > 0
                  ? Math.round(((mrp - price) / mrp) * 100)
                  : 0;

              return (
                <div
                  key={p._id}
                  className="productCard"
                  onClick={() => router.push(`/products/${p.slug}`)}
                >
                  <img src={image} alt={p.name} />

                  <div className="productBody">
                    <h3>{p.name}</h3>

                    <div className="priceRow">
                      <span className="price">₹{price}</span>

                      {mrp > price && (
                        <span className="mrp">₹{mrp}</span>
                      )}
                    </div>

                    {discount > 0 && (
                      <span className="badge">
                        {discount}% OFF
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          productId: p._id,
                          productKey: p.productKey,
                          name: p.name,
                          price,
                          image,
                          qty: 1,
                        });
                      }}
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
        .home { font-family: system-ui; }

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

        h1 { font-size: 64px; margin: 0; }
        .tagline { font-size: 22px; }
        .desc { margin: 20px 0; }

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
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: 0.2s;
          position: relative;
        }

        .productCard:hover {
          transform: translateY(-5px);
        }

        .productCard img {
          width: 100%;
          height: 220px;
          object-fit: cover;
        }

        .productBody {
          padding: 15px;
        }

        .priceRow {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .price {
          font-weight: bold;
          font-size: 18px;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
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

        .productBody button {
          width: 100%;
          margin-top: 10px;
        }

        .why {
          background: #f4efe6;
          padding: 70px 20px;
          text-align: center;
        }

        .icon { font-size: 40px; }

        .center { text-align: center; }
      `}</style>
    </div>
  );
}
