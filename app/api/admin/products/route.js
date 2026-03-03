"use client";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div style={{ padding: "60px" }}>
      {products.map((p) => (
        <div key={p._id} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "20px" }}>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <p>Price: ₹{p.price}</p>
          {p.image && <img src={p.image} alt={p.name} style={{ width: "120px" }} />}
          <button onClick={() => addToCart(p)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
