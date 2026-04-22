"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      setProduct(data.product);
    }

    load();
  }, [slug]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="container">
      <img src={product.image} />

      <div>
        <h1>{product.name}</h1>
        <p>₹{product.price}</p>
        <button onClick={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>

      <style jsx>{`
        .container {
          max-width: 900px;
          margin: auto;
          padding: 40px;
          display: flex;
          gap: 30px;
        }

        img {
          width: 300px;
          border-radius: 10px;
        }

        button {
          background: #c28b45;
          color: white;
          padding: 10px;
          border: none;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
