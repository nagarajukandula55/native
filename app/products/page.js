"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Products() {
  const { addToCart } = useCart();

  const products = [
    {
      id: "1",
      name: "A2 Desi Cow Ghee",
      price: 1299,
      image: "https://images.unsplash.com/photo-1585238342028-4e7c17a94c1a",
    },
    {
      id: "2",
      name: "Cold Pressed Groundnut Oil",
      price: 899,
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
    },
    {
      id: "3",
      name: "Organic Turmeric Powder",
      price: 499,
      image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec",
    },
  ];

  return (
    <div
      style={{
        padding: "80px 60px",
        backgroundColor: "#f4efe6",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          marginBottom: "60px",
          textAlign: "center",
          color: "#3a2a1c",
        }}
      >
        Our Products
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "15px",
              overflow: "hidden",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
              }}
            />

            <div style={{ padding: "25px" }}>
              <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
                {product.name}
              </h2>

              <p
                style={{
                  fontSize: "18px",
                  color: "#7a5c3e",
                  marginBottom: "20px",
                }}
              >
                ₹{product.price}
              </p>

              {/* Add to Cart Button */}
              <button
                onClick={() => addToCart(product)}
                style={{
                  padding: "10px 25px",
                  borderRadius: "25px",
                  backgroundColor: "#8b5e3c",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "15px",
                }}
              >
                Add to Cart
              </button>

              <br />

              <Link
                href={`/products/${product.id}`}
                style={{
                  padding: "10px 25px",
                  borderRadius: "25px",
                  backgroundColor: "#c28b45",
                  color: "#fff",
                  textDecoration: "none",
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
