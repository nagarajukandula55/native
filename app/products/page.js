"use client";

import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "80px 60px", background: "#f4efe6" }}>
      <h1 style={{ fontSize: "48px", textAlign: "center" }}>
        Our Products
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px",
          marginTop: "50px",
        }}
      >
        {products.length === 0 ? (
          <p style={{ textAlign: "center", gridColumn: "1/-1" }}>
            No products available.
          </p>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              style={{
                background: "#fff",
                borderRadius: "15px",
                padding: "20px",
                textAlign: "center",
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
                    marginBottom: "15px",
                  }}
                />
              )}

              <h2>{product.name}</h2>
              <p>₹{product.price}</p>
              {product.description && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#555",
                    marginBottom: "10px",
                  }}
                >
                  {product.description}
                </p>
              )}

              <button
                onClick={() => addToCart(product)}
                style={{
                  padding: "10px 20px",
                  marginBottom: "10px",
                  backgroundColor: "#8b5e3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Add to Cart
              </button>

              <br />

              <a
                href={`/products/${product._id}`}
                style={{
                  color: "#c28b45",
                  textDecoration: "none",
                }}
              >
                View Product
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
