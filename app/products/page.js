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
      image:
        "https://images.unsplash.com/photo-1585238342028-4e7c17a94c1a",
    },
    {
      id: "2",
      name: "Cold Pressed Groundnut Oil",
      price: 899,
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950",
    },
    {
      id: "3",
      name: "Organic Turmeric Powder",
      price: 499,
      image:
        "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec",
    },
  ];

  return (
    <div style={{ padding: "80px 60px", background: "#f4efe6" }}>
      <h1 style={{ fontSize: "48px", textAlign: "center" }}>
        Our Products
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "40px",
          marginTop: "50px",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
            />

            <h2>{product.name}</h2>
            <p>₹{product.price}</p>

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

            <Link
              href={`/products/${product.id}`}
              style={{
                color: "#c28b45",
                textDecoration: "none",
              }}
            >
              View Product
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
