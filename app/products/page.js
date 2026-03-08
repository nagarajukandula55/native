"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products from API
  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) return <p style={{ padding: "40px" }}>Loading products...</p>;

  if (!products || products.length === 0)
    return <p style={{ padding: "40px" }}>No products available.</p>;

  return (
    <div style={{ padding: "40px", fontFamily: "'Arial', sans-serif" }}>
      <h1>Our Products</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {p.featured && (
              <span
                style={{
                  position: "absolute",
                  background: "#ff4d4f",
                  color: "#fff",
                  padding: "5px 10px",
                  borderRadius: "0 0 10px 0",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                Featured
              </span>
            )}
            {p.image && (
              <img
                src={p.image}
                alt={p.alt || p.name}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
            )}
            <div style={{ padding: "15px", flexGrow: 1 }}>
              <h3 style={{ margin: "0 0 10px" }}>{p.name}</h3>
              <p style={{ margin: "0 0 10px", color: "#555" }}>{p.description}</p>
              <p style={{ margin: "0 0 5px", fontWeight: "bold" }}>₹{p.price}</p>
              <p style={{ margin: "0 0 5px" }}>Stock: {p.stock}</p>
              <p style={{ margin: "0 0 10px", fontStyle: "italic" }}>
                Category: {p.category}
              </p>
              <Link
                href={`/products/${p.slug}`}
                style={{
                  textDecoration: "none",
                  color: "#fff",
                  background: "#1890ff",
                  padding: "8px 12px",
                  borderRadius: "5px",
                  display: "inline-block",
                }}
              >
                View Product
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
