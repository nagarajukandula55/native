"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addToCart } = useCart();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState("");

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await res.json();

        const list = data?.products || [];
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Product fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  /* ================= ADD TO CART ================= */
  function handleAddToCart(p, price) {
    addToCart({
      id: p._id,
      name: p.name,
      price,
      image: p.images?.[0],
    });

    setToast(`${p.name} added to cart`);
    setTimeout(() => setToast(""), 2000);
  }

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

                  {/* CLICKABLE AREA */}
                  <div
                    className="clickArea"
                    onClick={() => router.push(`/products/${p.slug}`)}
                  >
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.name}
                    />

                    <div className="productBody">
                      <h3>{p.name}</h3>

                      <p className="desc">
                        {p.shortDescription ||
                          p.description ||
                          "No description available"}
                      </p>

                      <div className="priceBox">
                        <span className="price">₹{price}</span>

                        {mrp > price && (
                          <>
                            <span className="mrp">₹{mrp}</span>
                            <span className="off">{discount}% OFF</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ADD TO CART BUTTON */}
                  <button
                    className="cartBtn"
                    onClick={() => handleAddToCart(p, price)}
                  >
                    Add to Cart
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= WHY ================= */}
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

      {/* ================= TOAST ================= */}
      {toast && <div className="toast">{toast}</div>}

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
          display: flex;
          flex-direction: column;
        }

        .clickArea {
          cursor: pointer;
        }

        .productCard img {
          width: 100%;
          height: 220px;
          object-fit: cover;
        }

        .productBody {
          padding: 15px;
        }

        .desc {
          font-size: 13px;
          color: #666;
          height: 40px;
          overflow: hidden;
        }

        .price {
          font-weight: bold;
          font-size: 18px;
        }

        .mrp {
          text-decoration: line-through;
          color: #888;
          margin-left: 8px;
        }

        .off {
          color: green;
          margin-left: 8px;
        }

        .cartBtn {
          margin: 10px;
          padding: 10px;
          background: black;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: black;
          color: white;
          padding: 10px 15px;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
