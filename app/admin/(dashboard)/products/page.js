"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "./ProductForm";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/products");
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= HANDLE EDIT ================= */
  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  /* ================= HANDLE SUCCESS ================= */
  const handleSuccess = (updatedProduct) => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  /* ================= HANDLE TOGGLE ACTIVE ================= */
  const toggleActive = async (product) => {
    try {
      await axios.put(`/api/admin/products/${product._id}`, {
        ...product,
        active: !product.active,
      });
      fetchProducts();
    } catch (err) {
      console.error("TOGGLE ACTIVE ERROR:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Products Management</h1>

      <button
        onClick={() => {
          setEditingProduct(null);
          setShowForm(true);
        }}
        style={{ marginBottom: 20 }}
      >
        Add New Product
      </button>

      {showForm && (
        <ProductForm product={editingProduct} onSuccess={handleSuccess} />
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Price</th>
              <th>MRP</th>
              <th>Discount %</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      width={60}
                      height={60}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.subcategory}</td>
                <td>{p.price}</td>
                <td>{p.mrp}</td>
                <td>{p.discount}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={() => toggleActive(p)}
                  />
                </td>
                <td>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
