"use client";

import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();

        console.log("API DATA:", data);

        // ✅ ensure products is always an array
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }

      } catch (err) {
        console.error("Fetch failed:", err);
        setProducts([]);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "60px" }}>
      <h1>Our Products</h1>

      {products.length === 0 && <p>No products found</p>}

      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: "1px solid #ddd", padding: "20px" }}>
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
            )}

            <h3>{product.name}</h3>
            <p>₹{product.price}</p>

            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
