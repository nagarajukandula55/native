"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch public products API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products"); // PUBLIC API
        const data = await res.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.warn("Products API returned unexpected data", data);
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section
        style={{
          position: "relative",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px",
          background: "url('/hero.png') center/cover no-repeat",
          overflow: "hidden",
        }}
      >
        {/* DARK OVERLAY */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 1,
          }}
        />

        {/* SCROLLING TEXT */}
        <div
          style={{
            position: "absolute",
            top: 20,
            width: "100%",
            zIndex: 2,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              display: "inline-block",
              paddingLeft: "100%",
              animation: "scroll-left 15s linear infinite",
              color: "#fff",
              fontWeight: 500,
              fontSize: 18,
            }}
          >
            We are going to get new products to our Catalogue
          </div>
        </div>

        {/* HERO CONTENT */}
        <div style={{ maxWidth: "800px", position: "relative", zIndex: 2, color: "#fff" }}>
          <h1
            style={{
              fontSize: "clamp(48px,7vw,80px)",
              fontFamily: "Cinzel, serif",
              fontWeight: 600,
              marginBottom: "10px",
            }}
          >
            Welcome to Native
          </h1>
          <p style={{ fontSize: 22, marginBottom: 20 }}>Eat Healthy, Stay Healthy</p>
          <p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 30 }}>
            Authentic natural food products refined directly from the source.
            Pure, traditional and healthy for everyday life.
          </p>
          <button
            onClick={() => document.getElementById("products").scrollIntoView({ behavior: "smooth" })}
            style={{
              padding: "14px 40px",
              borderRadius: "40px",
              border: "none",
              background: "#c28b45",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#a67030")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#c28b45")}
          >
            Explore Products
          </button>
        </div>

        {/* SCROLL ANIMATION */}
        <style>
          {`
            @keyframes scroll-left {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-100%); }
            }
          `}
        </style>
      </section>

      {/* CATEGORY SECTION */}
      <section style={{ padding: "70px 20px", maxWidth: 1200, margin: "auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, marginBottom: 40 }}>Our Categories</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 25,
          }}
        >
          {["Batter Mix", "Cold Pressed Oils", "Traditional Foods", "Natural Products"].map((cat) => (
            <div
              key={cat}
              style={{
                background: "#fff",
                padding: "40px 20px",
                borderRadius: 10,
                fontSize: 18,
                fontWeight: 500,
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="products" style={{ padding: "70px 20px", maxWidth: 1200, margin: "auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 36, marginBottom: 50 }}>Featured Products</h2>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading products...</p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: "center" }}>No products available</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
              gap: 30,
            }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
                }}
              >
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  style={{ width: "100%", height: 220, objectFit: "cover" }}
                />
                <div style={{ padding: 20, textAlign: "center" }}>
                  <h3 style={{ marginBottom: 10, color: "#333" }}>{product.name}</h3>
                  <p style={{ color: "#c28b45", fontSize: 18, marginBottom: 15 }}>₹{product.price}</p>
                  <button
                    onClick={() => {
                      addToCart(product);
                      window.dispatchEvent(new Event("cart-open"));
                    }}
                    style={{
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: 25,
                      background: "#c28b45",
                      color: "#fff",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#a67030")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#c28b45")}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* WHY NATIVE */}
      <section style={{ background: "#f4efe6", padding: "70px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, marginBottom: 40 }}>Why Choose Native</h2>
        <div
          style={{
            maxWidth: 1000,
            margin: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 30,
          }}
        >
          {[
            { icon: "🌿", text: "100% Natural" },
            { icon: "🚜", text: "Direct From Farmers" },
            { icon: "🧂", text: "Traditional Methods" },
            { icon: "❤️", text: "Healthy Lifestyle" },
          ].map((item) => (
            <div
              key={item.text}
              style={{
                background: "#fff",
                padding: 30,
                borderRadius: 10,
                fontSize: 18,
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span style={{ fontSize: 40 }}>{item.icon}</span>
              <br />
              <strong>{item.text}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
