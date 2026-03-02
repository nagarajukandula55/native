"use client";

import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: parseFloat(price) }),
    });
    setName("");
    setPrice("");
    fetchProducts();
  };

  return (
    <div style={{ padding: "60px" }}>
      <h1>Manage Products</h1>

      <div>
        <input
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
        />
        <button onClick={handleAdd}>Add Product</button>
      </div>

      <ul>
        {products.map((p) => (
          <li key={p._id}>
            {p.name} — ₹{p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
