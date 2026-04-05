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
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [form, setForm] = useState({
    _id: null,
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

      let res;
      if (form._id) {
        res = await axios.put(`/api/admin/products/${form._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post("/api/admin/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data.success) {
        alert("Product saved successfully!");
        setFormVisible(false);
        setForm({ _id: null, name: "", description: "", shortDescription: "", websiteCategory: "", gstCategory: "", costPrice: "", mrp: "", sellingPrice: "", discount: "", images: [], active: true });
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

  function toggleForm(product = null) {
    if (product) {
      setForm({
        _id: product._id,
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        websiteCategory: product.websiteCategory?._id || "",
        gstCategory: product.gstCategory?._id || "",
        costPrice: product.costPrice,
        mrp: product.mrp,
        sellingPrice: product.sellingPrice,
        discount: product.discount,
        images: [], // editing images separately
        active: product.active,
      });
    } else {
      setForm({ _id: null, name: "", description: "", shortDescription: "", websiteCategory: "", gstCategory: "", costPrice: "", mrp: "", sellingPrice: "", discount: "", images: [], active: true });
    }
    setFormVisible(!formVisible);
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    try {
      const res = await axios.post("/api/admin/categories", { name: newCategoryName });
      if (res.data.success) {
        fetchCategories();
        setNewCategoryName("");
        setCategoryModalVisible(false);
      } else {
        alert(res.data.message || "Failed to add category");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while adding category!");
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Products</h1>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => toggleForm()}>{formVisible ? "Close Form" : "Add New Product"}</button>
        <button onClick={() => setCategoryModalVisible(true)}>Add Website Category</button>
      </div>

      {/* Add Category Modal */}
      {categoryModalVisible && (
        <div style={{ marginBottom: 20, padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
          <h3>Add New Category</h3>
          <input type="text" placeholder="Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
          <button onClick={handleAddCategory} style={{ marginLeft: 10 }}>
            Add
          </button>
          <button onClick={() => setCategoryModalVisible(false)} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      )}

      {/* Product Form */}
      {formVisible && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30, padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
          <input type="text" name="name" placeholder="Product Name" value={form.name} onChange={handleInput} required />
          <textarea name="description" placeholder="Full Description" value={form.description} onChange={handleInput} rows={4} required />
          <textarea name="shortDescription" placeholder="Short Description" value={form.shortDescription} onChange={handleInput} rows={2} />

          <select name="websiteCategory" value={form.websiteCategory} onChange={handleInput} required>
            <option value="">Select Website Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select name="gstCategory" value={form.gstCategory} onChange={handleInput} required>
            <option value="">Select GST Category</option>
            {gstCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} - HSN: {c.hsn} - GST: {c.gst}%
              </option>
            ))}
          </select>

          <input type="number" name="costPrice" placeholder="Cost Price" value={form.costPrice} onChange={handleInput} required />
          <input type="number" name="mrp" placeholder="MRP" value={form.mrp} onChange={handleInput} required />
          <input type="number" name="sellingPrice" placeholder="Selling Price" value={form.sellingPrice} onChange={handleInput} required />
          <input type="number" name="discount" placeholder="Discount %" value={form.discount} onChange={handleInput} />

          <input type="file" name="images" multiple accept="image/*" onChange={handleFileChange} />

          <label>
            <input type="checkbox" name="active" checked={form.active} onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))} /> Active
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : form._id ? "Update Product" : "Save Product"}
          </button>
        </form>
      )}

      {/* Products Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Images</th>
            <th>Name</th>
            <th>Website Category</th>
            <th>GST Category</th>
            <th>MRP</th>
            <th>Selling Price</th>
            <th>Discount %</th>
            <th>Active</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9}>Loading...</td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={9}>No products found</td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p._id}>
                <td style={{ display: "flex", gap: 5 }}>
                  {p.images &&
                    p.images.map((img, idx) => (
                      <Image key={idx} src={img.url} alt={p.name} width={50} height={50} style={{ objectFit: "cover", borderRadius: 4 }} />
                    ))}
                </td>
                <td>{p.name}</td>
                <td>{p.websiteCategory?.name || "-"}</td>
                <td>{p.gstCategory?.name || "-"}</td>
                <td>{p.mrp}</td>
                <td>{p.sellingPrice}</td>
                <td>{p.discount}</td>
                <td>{p.active ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => toggleForm(p)}>Edit</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
