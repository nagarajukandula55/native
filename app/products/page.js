"use client";

import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();

      console.log("API RESPONSE:", data);

      setProducts(data.products || []);

    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "80px 60px", background: "#f4efe6" }}>
      <h1 style={{ textAlign: "center" }}>Our Products</h1>

      {products.length === 0 && (
        <p style={{ textAlign: "center" }}>No products available</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "40px",
          marginTop: "40px",
        }}
      >
        {products.map((product) => (
          <div key={product.id}>
            <h2>{product.name}</h2>
            <p>₹{product.price}</p>

            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                width={200}
              />
            )}

            <button onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
