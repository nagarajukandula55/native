"use client";

import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/admin/products");

      const data = await res.json();

      console.log("API RESPONSE:", data);

      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }

    } catch (error) {
      console.error("Fetch error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "80px", textAlign: "center" }}>
        Loading products...
      </div>
    );
  }

  return (
    <div style={{ padding: "80px 60px", background: "#f4efe6" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        Our Products
      </h1>

      {products.length === 0 && (
        <p style={{ textAlign: "center" }}>No products available</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "40px",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            )}

            <h3 style={{ marginTop: "10px" }}>{product.name}</h3>

            <p style={{ color: "#555" }}>
              ₹{product.price}
            </p>

            <button
              onClick={() => addToCart(product)}
              style={{
                marginTop: "10px",
                padding: "10px 15px",
                background: "#b08968",
                border: "none",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
