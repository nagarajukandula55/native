"use client";

import { useEffect, useState } from "react";

export default function ProductsDashboard() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", image: "" });

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : "";

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setProducts(data);
  };

  const handleAddProduct = async () => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newProduct, price: Number(newProduct.price), visible: true }),
    });
    await res.json();
    setNewProduct({ name: "", price: "", image: "" });
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    fetchProducts();
  };

  useEffect(() => { if (token) fetchProducts(); }, [token]);

  return (
    <div style={{ padding: "50px" }}>
      <h1>Products Dashboard</h1>

      <div style={{ margin: "30px 0", display: "flex", gap: "10px" }}>
        <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
        <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
        <input placeholder="Image URL" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />
        <button onClick={handleAddProduct} style={{ backgroundColor: "#c28b45", color: "#fff", padding: "5px 15px" }}>Add</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th><th>Price</th><th>Image</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td><img src={p.image} alt={p.name} style={{ width: "50px" }} /></td>
              <td><button onClick={() => handleDelete(p._id)} style={{ color: "red" }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
