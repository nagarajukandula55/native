"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    websiteCategory: "",
    gstCategory: "",
    costPrice: "",
    mrp: "",
    sellingPrice: "",
    discount: "",
    images: [],
    active: true,
  });

  // Fetch Products & Categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchGstCategories();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await axios.get("/api/admin/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchGstCategories() {
    try {
      const res = await axios.get("/api/admin/gstCategories");
      setGstCategories(res.data.gstCategories || []);
    } catch (err) {
      console.error(err);
    }
  }

  function handleInput(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, images: files }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "images") {
          form.images.forEach((file) => formData.append("images", file));
        } else {
          formData.append(key, form[key]);
        }
      });

      const res = await axios.post("/api/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("Product saved successfully!");
        setFormVisible(false);
        fetchProducts();
      } else {
        alert(res.data.message || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      alert("Server error!");
    } finally {
      setLoading(false);
    }
  }

  function toggleForm() {
    setFormVisible(!formVisible);
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Products</h1>
      <button onClick={toggleForm} style={{ marginBottom: 20 }}>
        {formVisible ? "Close Form" : "Add New Product"}
      </button>

      {formVisible && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 30,
            padding: 20,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleInput}
            required
          />
          <textarea
            name="description"
            placeholder="Full Description"
            value={form.description}
            onChange={handleInput}
            rows={4}
            required
          />
          <textarea
            name="shortDescription"
            placeholder="Short Description"
            value={form.shortDescription}
            onChange={handleInput}
            rows={2}
          />

          {/* Website Category */}
          <select
            name="websiteCategory"
            value={form.websiteCategory}
            onChange={handleInput}
            required
          >
            <option value="">Select Website Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* GST Category */}
          <select
            name="gstCategory"
            value={form.gstCategory}
            onChange={handleInput}
            required
          >
            <option value="">Select GST Category</option>
            {gstCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} - HSN: {c.hsn} - GST: {c.gst}%
              </option>
            ))}
          </select>

          <input
            type="number"
            name="costPrice"
            placeholder="Cost Price"
            value={form.costPrice}
            onChange={handleInput}
            required
          />
          <input
            type="number"
            name="mrp"
            placeholder="MRP"
            value={form.mrp}
            onChange={handleInput}
            required
          />
          <input
            type="number"
            name="sellingPrice"
            placeholder="Selling Price"
            value={form.sellingPrice}
            onChange={handleInput}
            required
          />
          <input
            type="number"
            name="discount"
            placeholder="Discount %"
            value={form.discount}
            onChange={handleInput}
          />

          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            required
          />

          <label>
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, active: e.target.checked }))
              }
            />{" "}
            Active
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </button>
        </form>
      )}

      {/* Products Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Website Category</th>
            <th>GST Category</th>
            <th>MRP</th>
            <th>Selling Price</th>
            <th>Discount %</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8}>Loading...</td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={8}>No products found</td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p._id}>
                <td>
                  {p.images && p.images.length > 0 && (
                    <Image
                      src={p.images[0].url}
                      alt={p.name}
                      width={80}
                      height={80}
                      style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.websiteCategory?.name || "-"}</td>
                <td>{p.gstCategory?.name || "-"}</td>
                <td>{p.mrp}</td>
                <td>{p.sellingPrice}</td>
                <td>{p.discount}</td>
                <td>{p.active ? "Yes" : "No"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
