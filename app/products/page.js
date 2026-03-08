"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products || []);
    };
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Products</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map(p => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px", width: "200px" }}>
            {p.image && <img src={p.image} alt={p.alt || p.name} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "6px" }} />}
            <h4>{p.name}</h4>
            <p>₹{p.price}</p>
            <Link href={`/products/${p.slug}`} style={{ color: "#1890ff" }}>View Product</Link>
            <button style={{ marginTop: "5px", padding: "5px 10px", background: "#1890ff", color: "#fff", borderRadius: "4px" }}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
