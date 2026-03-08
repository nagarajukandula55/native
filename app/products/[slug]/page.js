"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch single product by slug
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error("Product not found");

        const data = await res.json();
        if (!data.product) throw new Error("Product not found");

        setProduct(data.product);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadProduct();
  }, [slug]);

  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;
  if (error)
    return (
      <div style={{ padding: "40px" }}>
        <p>{error}</p>
        <Link href="/products" style={{ color: "#1890ff" }}>
          &larr; Back to Products
        </Link>
      </div>
    );

  return (
    <div style={{ padding: "40px", fontFamily: "'Arial', sans-serif" }}>
      <Link href="/products" style={{ color: "#1890ff", marginBottom: "20px", display: "inline-block" }}>
        &larr; Back
      </Link>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {product.image && (
          <img
            src={product.image}
            alt={product.alt || product.name}
            style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "10px" }}
          />
        )}
        <h1>{product.name}</h1>
        <p style={{ fontWeight: "bold", fontSize: "20px" }}>₹{product.price}</p>
        <p>{product.description}</p>
        <p>Stock: {product.stock}</p>
        <p>Category: {product.category}</p>
        {product.featured && (
          <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>★ Featured Product</p>
        )}
        <button
          style={{
            padding: "10px 15px",
            background: "#1890ff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
