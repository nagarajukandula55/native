"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function ProductForm({ product, onSuccess }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    price: product?.price || 0,
    mrp: product?.mrp || 0,
    costPrice: product?.costPrice || 0,
    gstPercent: product?.gstPercent || 0,
    hsnCode: product?.hsnCode || "",
    discount: product?.discount || 0,
    description: product?.description || "",
    images: product?.images || [],
    active: product?.active ?? true,
    tags: product?.tags || [],
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
  });

  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    axios.get("/api/admin/categories").then(res => {
      if (res.data.success) setCategories(res.data.categories);
    });
  }, []);

  /* ================= HANDLE IMAGE UPLOAD ================= */
  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      formData
    );

    setForm(prev => ({ ...prev, images: [...prev.images, res.data.secure_url] }));
    setUploading(false);
  }

  /* ================= AUTO-GENERATE SEO & TAGS ================= */
  useEffect(() => {
    if (form.name && form.description) {
      setForm(prev => ({
        ...prev,
        seoTitle: form.name,
        seoDescription: form.description.substring(0, 160),
        tags: form.name.split(" ").map(t => t.toLowerCase())
      }));
    }
  }, [form.name, form.description]);

  /* ================= HANDLE FIELD CHANGE ================= */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  /* ================= HANDLE FORM SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const endpoint = product ? `/api/admin/products/${product._id}` : "/api/admin/products";
      const method = product ? "put" : "post";

      const res = await axios({ url: endpoint, method, data: form });
      if (res.data.success && onSuccess) onSuccess(res.data.product);
    } catch (err) {
      console.error("PRODUCT SAVE ERROR:", err);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: "auto" }}>
      <h2>{product ? "Edit Product" : "Add New Product"}</h2>

      <label>Name</label>
      <input type="text" name="name" value={form.name} onChange={handleChange} required />

      <label>Category</label>
      <select name="category" value={form.category} onChange={handleChange} required>
        <option value="">Select Category</option>
        {categories.map(c => (
          <option key={c._id} value={c.name}>{c.name}</option>
        ))}
      </select>

      <label>Subcategory</label>
      <input type="text" name="subcategory" value={form.subcategory} onChange={handleChange} />

      <label>Price</label>
      <input type="number" name="price" value={form.price} onChange={handleChange} required />

      <label>MRP</label>
      <input type="number" name="mrp" value={form.mrp} onChange={handleChange} required />

      <label>Cost Price</label>
      <input type="number" name="costPrice" value={form.costPrice} onChange={handleChange} />

      <label>GST %</label>
      <input type="number" name="gstPercent" value={form.gstPercent} readOnly />

      <label>HSN Code</label>
      <input type="text" name="hsnCode" value={form.hsnCode} readOnly />

      <label>Discount %</label>
      <input type="number" name="discount" value={form.discount} onChange={handleChange} />

      <label>Description</label>
      <textarea name="description" value={form.description} onChange={handleChange}></textarea>

      <label>Images</label>
      <input type="file" onChange={handleUpload} />
      {uploading && <p>Uploading...</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        {form.images.map((img, idx) => (
          <img key={idx} src={img} width={80} height={80} style={{ objectFit: "cover" }} />
        ))}
      </div>

      <label>
        <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
        Active
      </label>

      <button type="submit" style={{ marginTop: 20 }}>
        {product ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}
