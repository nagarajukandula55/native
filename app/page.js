"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products"); // ✅ PUBLIC API
        const data = await res.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.warn("Products API returned unexpected data", data);
          setProducts([]);
        }
      } catch (err) {
        console.error(err);
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
        <div style={{ maxWidth: "800px", position: "relative", zIndex: 2, color: "#fff" }}>
          <h1 style={{ fontSize: "clamp(48px,7vw,80px)", fontFamily: "Cinzel, serif", fontWeight: 600 }}>
            Welcome to Native
          </h1>
          <p style={{ fontSize: 22 }}>Eat Healthy, Stay Healthy</p>
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
            }}
          >
            Explore Products
          </button>
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
              gap: "30px",
            }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  background: "#fff",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 8 }}
                />
                <h3 style={{ marginTop: 15 }}>{product.name}</h3>
                <p style={{ color: "#c28b45", fontSize: 18, margin: "10px 0" }}>₹{product.price}</p>
                <button
                  onClick={() => {
                    addToCart(product);
                    window.dispatchEvent(new Event("cart-open"));
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "25px",
                    border: "none",
                    background: "#c28b45",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
