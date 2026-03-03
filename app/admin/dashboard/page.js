"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", image: "" });
  const [loading, setLoading] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new product
  const addProduct = async () => {
    if (!form.name || !form.price) return alert("Name and price required");
    setLoading(true);
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    });
    setForm({ name: "", price: "", image: "" });
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  // Delete product
  const deleteProduct = async (id) => {
    setLoading(true);
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setProducts(products.filter((p) => p._id !== id));
    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "'Georgia', serif" }}>
      <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>Admin Dashboard</h1>

      {/* Add Product Form */}
      <div style={{ marginBottom: "30px" }}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <input
          type="text"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <button
          onClick={addProduct}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#c28b45",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Add Product"}
        </button>
      </div>

      {/* Product List */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Name
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Price
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Image
            </th>
            <th style={{ borderBottom: "2px solid #ccc", padding: "10px" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td style={{ padding: "10px" }}>{p.name}</td>
              <td style={{ padding: "10px" }}>₹{p.price}</td>
              <td style={{ padding: "10px" }}>
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                )}
              </td>
              <td style={{ padding: "10px" }}>
                <button
                  onClick={() => deleteProduct(p._id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#b02a37",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
