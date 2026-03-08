"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      }
    };
    loadProducts();
  }, []);

  const addToCart = (product) => {
    const exists = cart.find((p) => p.id === product.id);
    if (!exists) setCart([...cart, { ...product, quantity: 1 }]);
    else {
      // Increase quantity
      setCart(
        cart.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p))
      );
    }
    alert(`${product.name} added to cart`);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "'Arial', sans-serif'" }}>
      <h2>Products</h2>
      {products.length === 0 && <p>No products found</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              width: "220px",
            }}
          >
            {p.image && (
              <img
                src={p.image}
                alt={p.alt || p.name}
                style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }}
              />
            )}
            <h4>{p.name}</h4>
            <p>₹{p.price}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={() => addToCart(p)}
                style={{
                  flex: 1,
                  background: "#1890ff",
                  color: "#fff",
                  border: "none",
                  padding: "5px 0",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Add to Cart
              </button>
              <Link
                href={`/products/${p.slug}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: "#f0f0f0",
                  color: "#000",
                  padding: "5px 0",
                  borderRadius: "5px",
                  textDecoration: "none",
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
