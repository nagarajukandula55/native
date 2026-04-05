"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

// Helper to upload images to Cloudinary
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await res.json();
  return data.secure_url;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    _id: null,
    name: "",
    description: "",
    categoryId: "",
    gstCategory: "",
    mrp: 0,
    costPrice: 0,
    discount: 0,
    images: [],
    status: "active",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("/api/admin/products");
    if (res.data.success) setProducts(res.data.products);
  };

  const fetchCategories = async () => {
    const res = await axios.get("/api/admin/categories");
    if (res.data.success) setCategories(res.data.categories);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const urls = [];
    setLoading(true);
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      urls.push(url);
    }
    setForm({ ...form, images: [...form.images, ...urls] });
    setLoading(false);
  };

  const handleSaveProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/admin/products", form);
      if (res.data.success) {
        fetchProducts();
        setShowForm(false);
        setForm({
          _id: null,
          name: "",
          description: "",
          categoryId: "",
          gstCategory: "",
          mrp: 0,
          costPrice: 0,
          discount: 0,
          images: [],
          status: "active",
        });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleEditProduct = (product) => {
    setForm({
      _id: product._id,
      name: product.name,
      description: product.description,
      categoryId: product.category?._id || "",
      gstCategory: product.gstCategory || "",
      mrp: product.mrp,
      costPrice: product.costPrice,
      discount: product.discount,
      images: product.images || [],
      status: product.status,
    });
    setShowForm(true);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    try {
      const res = await axios.post("/api/admin/categories", { name: newCategoryName });
      if (res.data.success) {
        fetchCategories();
        setNewCategoryName("");
      } else alert(res.data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Products</h1>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={formContainer}>
          <h2>{form._id ? "Edit Product" : "Add New Product"}</h2>

          <input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={input}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...input, height: 80 }}
          />

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              style={input}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              placeholder="New Category"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={input}
            />
            <button onClick={handleAddCategory} style={button}>
              Add Category
            </button>
          </div>

          <select
            value={form.gstCategory}
            onChange={(e) => setForm({ ...form, gstCategory: e.target.value })}
            style={input}
          >
            <option value="">Select GST Category</option>
            <option value="Food - Batter Mix">Food - Batter Mix</option>
            <option value="Food - Spices">Food - Spices</option>
            <option value="Food - Honey">Food - Honey</option>
            <option value="Food - Chutney Mix">Food - Chutney Mix</option>
            <option value="Food - Masala">Food - Masala</option>
            <option value="Food - Cold Pressed Oil">Food - Cold Pressed Oil</option>
          </select>

          <input
            type="number"
            placeholder="MRP"
            value={form.mrp}
            onChange={(e) => setForm({ ...form, mrp: parseFloat(e.target.value) })}
            style={input}
          />
          <input
            type="number"
            placeholder="Cost Price"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) })}
            style={input}
          />
          <input
            type="number"
            placeholder="Discount %"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) })}
            style={input}
          />

          <input type="file" multiple onChange={handleImageChange} />
          {form.images.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              {form.images.map((img, idx) => (
                <Image key={idx} src={img} alt="product" width={80} height={80} style={{ borderRadius: 8 }} />
              ))}
            </div>
          )}

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            style={input}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button onClick={handleSaveProduct} style={button} disabled={loading}>
            {loading ? "Saving..." : "Save Product"}
          </button>

          <button
            onClick={() => {
              setShowForm(false);
              setForm({
                _id: null,
                name: "",
                description: "",
                categoryId: "",
                gstCategory: "",
                mrp: 0,
                costPrice: 0,
                discount: 0,
                images: [],
                status: "active",
              });
            }}
            style={{ ...button, background: "#999" }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Products Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>MRP</th>
            <th>Selling Price</th>
            <th>Status</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr key={p._id} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{idx + 1}</td>
              <td>
                {p.images && p.images[0] && (
                  <Image src={p.images[0]} alt="img" width={50} height={50} />
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.category?.name || ""}</td>
              <td>{p.mrp}</td>
              <td>{p.sellingPrice}</td>
              <td>{p.status}</td>
              <td>
                <button onClick={() => handleEditProduct(p)} style={button}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setShowForm(true)} style={{ ...button, marginTop: 20 }}>
        Add New Product
      </button>
    </div>
  );
}

/* ====== STYLES ====== */
const formContainer = {
  padding: 20,
  border: "1px solid #ccc",
  borderRadius: 10,
  marginBottom: 30,
  maxWidth: 700,
};
const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};
const button = {
  padding: "10px 15px",
  borderRadius: 6,
  border: "none",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};
