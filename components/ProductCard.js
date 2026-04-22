"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="card">
      <Link href={`/products/${product.slug}`}>
        <img src={product.image || "/placeholder.png"} alt={product.name} />
      </Link>

      <div className="body">
        <h3>{product.name}</h3>
        <p>₹{product.price}</p>

        <button onClick={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>

      <style jsx>{`
        .card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          transition: 0.2s;
        }

        .card:hover {
          transform: translateY(-3px);
        }

        img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .body {
          padding: 12px;
        }

        h3 {
          margin: 0;
          font-size: 16px;
        }

        p {
          margin: 5px 0;
          color: #c28b45;
          font-weight: 600;
        }

        button {
          width: 100%;
          padding: 8px;
          background: #c28b45;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        button:hover {
          background: #a36d32;
        }
      `}</style>
    </div>
  );
}
