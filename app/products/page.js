"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p style={{ padding: "40px" }}>Loading products...</p>;

  return (
    <div style={{ padding: "40px", fontFamily: "'Arial', sans-serif" }}>
      <h1>Products</h1>
      {products.length === 0 && <p>No products available.</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              width: "250px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              textAlign: "center",
            }}
          >
            {p.image && <img src={p.image} alt={p.alt || p.name} style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }} />}
            <h3>{p.name}</h3>
            <p style={{ fontWeight: "bold" }}>₹{p.price}</p>
            <Link href={`/products/${p.slug}`} style={{ color: "#1890ff" }}>
              View Product
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
