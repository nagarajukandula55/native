"use client";

import { useCart } from "./context/CartContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ------------------------
  // Fetch products from API
  // ------------------------
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();

      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "'Georgia', serif",
        backgroundColor: "#f4efe6",
        backgroundImage: "url('https://images.unsplash.com/photo-1603046891744-7610fdb6fb3d')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(244, 239, 230, 0.92)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Hero Section */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          textAlign: "center",
          paddingTop: "140px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "70px", marginBottom: "25px", fontWeight: "normal", color: "#3a2a1c" }}>
          Welcome to Native
        </h1>
        <p style={{ fontSize: "22px", lineHeight: "1.8", marginBottom: "50px", color: "#5c4634" }}>
          Eat Healthy, Stay Healthy. Authentic Indian products refined from the source — crafted with purity, tradition and trust.
        </p>
        <button
          onClick={() => document.getElementById("product-section")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            padding: "16px 55px",
            fontSize: "18px",
            borderRadius: "50px",
            border: "2px solid #c28b45",
            backgroundColor: "#c28b45",
            color: "#fff",
            cursor: "pointer",
            letterSpacing: "1px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          Explore Products
        </button>
      </div>

      {/* Products Section */}
      <section
        id="product-section"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "80px 60px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ fontSize: "36px", marginBottom: "40px", textAlign: "center" }}>Our Products</h2>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading products...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "30px",
            }}
          >
            {products.length === 0 ? (
              <p style={{ textAlign: "center", gridColumn: "1/-1" }}>No products available.</p>
            ) : (
              products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {/* Featured Badge */}
                  {p.featured && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "-40px",
                        transform: "rotate(-45deg)",
                        backgroundColor: "#c28b45",
                        color: "#fff",
                        padding: "5px 50px",
                        fontWeight: "bold",
                      }}
                    >
                      FEATURED
                    </span>
                  )}

                  {/* Product Image */}
                  <img
                    src={p.image || "https://via.placeholder.com/250x200?text=No+Image"}
                    alt={p.name}
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px", marginBottom: "15px" }}
                  />

                  {/* Product Info */}
                  <h3 style={{ marginBottom: "10px" }}>{p.name}</h3>
                  <p style={{ fontWeight: "bold", marginBottom: "10px" }}>₹{p.price}</p>
                  {p.description && (
                    <p style={{ marginBottom: "15px", fontSize: "14px", color: "#555" }}>{p.description}</p>
                  )}
                  <p style={{ fontSize: "13px", color: "#888", marginBottom: "10px" }}>
                    Stock: {p.stock || "N/A"} | Category: {p.category || "General"}
                  </p>

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(p)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "25px",
                      border: "none",
                      backgroundColor: "#c28b45",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "bold",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
