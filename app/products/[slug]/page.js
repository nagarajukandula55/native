"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function ProductViewPage() {
  const { slug } = useParams(); // Get the product slug from URL
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch all products
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        // Find the product by slug
        const foundProduct = data.find((p) => p.slug === slug);
        if (!foundProduct) throw new Error("Product not found");

        setProduct(foundProduct);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading product...</p>;
  if (error)
    return <p style={{ textAlign: "center", marginTop: "40px", color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      {/* Product Info */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", marginBottom: "50px" }}>
        {/* Image */}
        <div style={{ flex: "1 1 350px" }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: "100%", borderRadius: "10px", objectFit: "cover" }}
          />
        </div>

        {/* Details */}
        <div style={{ flex: "1 1 300px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>{product.name}</h1>
          <p style={{ fontSize: "20px", color: "#c28b45", marginBottom: "15px" }}>₹{product.price}</p>
          <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
            {product.description || "No description available."}
          </p>

          <button
            onClick={() => addToCart(product)}
            style={{
              padding: "12px 25px",
              background: "#c28b45",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Related Blog Posts Placeholder */}
      <div style={{ marginTop: "50px" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>Related Articles</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                textAlign: "center",
              }}
            >
              <h3>Blog Post {i}</h3>
              <p>Summary about this product...</p>
              <Link href={`/blog/${i}`} style={{ color: "#c28b45", fontWeight: "500" }}>
                Read More
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
