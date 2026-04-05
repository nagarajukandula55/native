"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    gstCategory: "",
    price: "",
    mrp: "",
    costPrice: "",
    discount: 0,
    description: "",
    images: [],
    active: true,
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch products & categories
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/admin/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("upload_preset", "native_upload"); // Cloudinary preset

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/upload`,
        formData
      );
      uploaded.push(res.data.secure_url);
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }));
  };

  // Auto-generate SEO tags
  const generateSEO = (name, description) => {
    const title = `${name} | Native Foods`;
    const metaDesc = description || `${name} - Buy online from Native Foods`;
    const keywords = name
      .split(" ")
      .map((w) => w.toLowerCase())
      .join(", ");
    return { title, metaDesc, keywords };
  };

  // Handle add/edit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        seo: generateSEO(form.name, form.description),
      };

      if (editing) {
        await axios.put(`/api/admin/products/${editing._id}`, payload);
      } else {
        await axios.post("/api/admin/products", payload);
      }

      setForm({
        name: "",
        category: "",
        gstCategory: "",
        price: "",
        mrp: "",
        costPrice: "",
        discount: 0,
        description: "",
        images: [],
        active: true,
      });
      setEditing(null);
      fetchProducts();
    } catch (err) {
      console.error("Save product error:", err);
    }

    setLoading(false);
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({ ...product });
    setEditing(product);
  };

  // Toggle active status
  const toggleActive = async (productId, active) => {
    try {
      await axios.put(`/api/admin/products/${productId}`, { active: !active });
      fetchProducts();
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  return (
    <div style={container}>
      <h1>Admin Products</h1>

      {/* Add/Edit Form */}
      <form style={formCard} onSubmit={handleSubmit}>
        <h2>{editing ? "Edit Product" : "Add Product"}</h2>

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
          style={input}
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          style={input}
        >
          <option value="">Select Website Category</option>
          {categories
            .filter((c) => c.type === "website")
            .map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
        </select>

        <select
          name="gstCategory"
          value={form.gstCategory}
          onChange={handleChange}
          required
          style={input}
        >
          <option value="">Select GST Category</option>
          {categories
            .filter((c) => c.type === "gst")
            .map((c) => (
              <option key={c._id} value={c.name}>
                {c.name} | HSN:{c.hsn} | GST:{c.gst}%
              </option>
            ))}
        </select>

        <input
          name="price"
          placeholder="Selling Price"
          type="number"
          value={form.price}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="mrp"
          placeholder="MRP"
          type="number"
          value={form.mrp}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="costPrice"
          placeholder="Cost Price"
          type="number"
          value={form.costPrice}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="discount"
          placeholder="Discount %"
          type="number"
          value={form.discount}
          onChange={handleChange}
          style={input}
        />

        <textarea
          name="description"
          placeholder="Product Description"
          value={form.description}
          onChange={handleChange}
          style={textarea}
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          style={input}
        />

        <div style={imagesPreview}>
          {form.images.map((img, idx) => (
            <Image key={idx} src={img} width={80} height={80} alt="Product" />
          ))}
        </div>

        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={() =>
              setForm((prev) => ({ ...prev, active: !prev.active }))
            }
          />{" "}
          Active
        </label>

        <button type="submit" disabled={loading} style={button}>
          {loading ? "Saving..." : editing ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Products Table */}
      <table style={table}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Website Cat</th>
            <th>GST Cat</th>
            <th>Price</th>
            <th>MRP</th>
            <th>Discount</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                {p.images && p.images[0] ? (
                  <Image src={p.images[0]} width={50} height={50} alt={p.name} />
                ) : (
                  "No Image"
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.gstCategory}</td>
              <td>{p.price}</td>
              <td>{p.mrp}</td>
              <td>{p.discount}%</td>
              <td>
                <input
                  type="checkbox"
                  checked={p.active}
                  onChange={() => toggleActive(p._id, p.active)}
                />
              </td>
              <td>
                <button onClick={() => handleEdit(p)} style={buttonSmall}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== STYLES ===== */
const container = { padding: 20 };
const formCard = {
  padding: 20,
  marginBottom: 40,
  borderRadius: 10,
  background: "#fff",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
};
const input = { width: "100%", padding: 10, marginBottom: 10, borderRadius: 5 };
const textarea = { width: "100%", padding: 10, marginBottom: 10, borderRadius: 5 };
const imagesPreview = { display: "flex", gap: 10, marginBottom: 10 };
const button = { padding: 10, background: "#111", color: "#fff", border: "none" };
const buttonSmall = { padding: 5, background: "#333", color: "#fff", border: "none" };
const table = { width: "100%", borderCollapse: "collapse" };
