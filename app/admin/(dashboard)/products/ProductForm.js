"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function ProductForm({ product, onSuccess }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "",
    gstCategory: product?.gstCategory || "",
    hsnCode: product?.hsnCode || "",
    gstPercent: product?.gstPercent || 0,
    costPrice: product?.costPrice || "",
    mrp: product?.mrp || "",
    sellingPrice: product?.sellingPrice || "",
    description: product?.description || "",
    status: product?.status || "active",
  });

  const [websiteCategories, setWebsiteCategories] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    axios.get("/api/admin/categories").then((res) => {
      if (res.data.success) {
        const all = res.data.categories;

        setWebsiteCategories(all.filter((c) => c.type === "website"));
        setGstCategories(all.filter((c) => c.type === "gst"));
      }
    });
  }, []);

  /* ================= GST AUTO-FILL ================= */
  function handleGstChange(e) {
    const selected = gstCategories.find((c) => c.name === e.target.value);

    setForm((prev) => ({
      ...prev,
      gstCategory: selected?.name || "",
      hsnCode: selected?.hsn || "",
      gstPercent: selected?.gst || 0,
    }));
  }

  /* ================= FIELD CHANGE ================= */
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* ================= IMAGE SELECT ================= */
  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    setImages(files);
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      // Append fields
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      // Append images
      images.forEach((file) => {
        formData.append("images", file);
      });

      if (product?._id) {
        formData.append("_id", product._id);
      }

      const endpoint = "/api/admin/products";
      const method = product ? "put" : "post";

      const res = await axios({
        url: endpoint,
        method,
        data: formData,
      });

      if (res.data.success && onSuccess) {
        onSuccess(res.data.product);
      }
    } catch (err) {
      console.error("PRODUCT SAVE ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 800,
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2>{product ? "Edit Product" : "Add Product"}</h2>

      {/* NAME */}
      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={form.name}
        onChange={handleChange}
        required
      />

      {/* WEBSITE CATEGORY */}
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
      >
        <option value="">Select Website Category</option>
        {websiteCategories.map((c) => (
          <option key={c._id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      {/* GST CATEGORY */}
      <select
        name="gstCategory"
        value={form.gstCategory}
        onChange={handleGstChange}
        required
      >
        <option value="">Select GST Category</option>
        {gstCategories.map((c) => (
          <option key={c._id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      {/* AUTO FILLED */}
      <input type="text" value={form.hsnCode} readOnly placeholder="HSN Code" />
      <input type="number" value={form.gstPercent} readOnly placeholder="GST %" />

      {/* PRICING */}
      <input
        type="number"
        name="costPrice"
        placeholder="Cost Price"
        value={form.costPrice}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="mrp"
        placeholder="MRP"
        value={form.mrp}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="sellingPrice"
        placeholder="Selling Price"
        value={form.sellingPrice}
        onChange={handleChange}
        required
      />

      {/* DESCRIPTION */}
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      {/* IMAGES */}
      <input type="file" multiple onChange={handleImageChange} />

      {/* STATUS */}
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* SUBMIT */}
      <button type="submit" disabled={loading}>
        {loading
          ? "Saving..."
          : product
          ? "Update Product"
          : "Create Product"}
      </button>
    </form>
  );
}
