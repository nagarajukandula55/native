"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";

// Cloudinary upload helper
const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.secure_url;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    categoryId: "",
    gstCategoryId: "",
    price: "",
    mrp: "",
    costPrice: "",
    discount: 0,
    status: "active",
    description: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/admin/products");
      setProducts(data.products || []);
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/admin/categories");
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadImageToCloudinary(file);
        urls.push(url);
      }
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };

      let res;
      if (formData._id) {
        // Edit product
        res = await axios.put(`/api/admin/products/${formData._id}`, payload);
      } else {
        // Add product
        res = await axios.post("/api/admin/products", payload);
      }

      if (res.data.success) {
        toast.success("Product saved successfully");
        fetchProducts();
        setFormData({
          _id: "",
          name: "",
          categoryId: "",
          gstCategoryId: "",
          price: "",
          mrp: "",
          costPrice: "",
          discount: 0,
          status: "active",
          description: "",
          images: [],
        });
      } else {
        toast.error(res.data.message || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }

    setLoading(false);
  };

  const handleEdit = (product) => {
    setFormData({
      _id: product._id,
      name: product.name,
      categoryId: product.categoryId?._id || "",
      gstCategoryId: product.gstCategoryId?._id || "",
      price: product.price,
      mrp: product.mrp,
      costPrice: product.costPrice,
      discount: product.discount || 0,
      status: product.status,
      description: product.description,
      images: product.images || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Admin Products</h1>

      {/* ===== Product Form ===== */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
          marginBottom: 40,
        }}
      >
        <h2>{formData._id ? "Edit Product" : "Add Product"}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginTop: 15 }}>
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Product Name"
            onChange={handleInputChange}
            required
          />

          <select
            name="gstCategoryId"
            value={formData.gstCategoryId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select GST Category</option>
            {categories
              .filter((c) => c.type === "gst")
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.hsnCode} | {c.gst}%)
                </option>
              ))}
          </select>

          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Website Category</option>
            {categories
              .filter((c) => c.type === "website")
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>

          <input
            type="number"
            name="price"
            value={formData.price}
            placeholder="Selling Price"
            onChange={handleInputChange}
            required
          />

          <input
            type="number"
            name="mrp"
            value={formData.mrp}
            placeholder="MRP"
            onChange={handleInputChange}
            required
          />

          <input
            type="number"
            name="costPrice"
            value={formData.costPrice}
            placeholder="Cost Price"
            onChange={handleInputChange}
            required
          />

          <input
            type="number"
            name="discount"
            value={formData.discount}
            placeholder="Discount %"
            onChange={handleInputChange}
          />

          <select name="status" value={formData.status} onChange={handleInputChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <textarea
          name="description"
          value={formData.description}
          placeholder="Description"
          onChange={handleInputChange}
          style={{ marginTop: 15, width: "100%", height: 100 }}
        />

        <div style={{ marginTop: 15 }}>
          <label>
            Upload Images (multiple):
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {formData.images.map((url, idx) => (
              <Image key={idx} src={url} alt={`img-${idx}`} width={80} height={80} />
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: 20 }}>
          {loading ? "Saving..." : formData._id ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* ===== Products Table ===== */}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <th>#</th>
            <th>Image</th>
            <th>Name</th>
            <th>Website Category</th>
            <th>GST Category</th>
            <th>Price</th>
            <th>MRP</th>
            <th>Discount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr key={p._id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{idx + 1}</td>
              <td>
                {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} width={50} height={50} /> : "No Image"}
              </td>
              <td>{p.name}</td>
              <td>{p.categoryId?.name || "-"}</td>
              <td>
                {p.gstCategoryId ? `${p.gstCategoryId.name} (${p.gstCategoryId.gst}%)` : "-"}
              </td>
              <td>{p.price}</td>
              <td>{p.mrp}</td>
              <td>{p.discount || 0}%</td>
              <td>{p.status}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
