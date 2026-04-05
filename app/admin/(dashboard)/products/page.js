"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

// Cloudinary upload helper
async function uploadToCloudinary(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: data,
  });

  const json = await res.json();
  return json.secure_url;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    gstCategory: "",
    costPrice: 0,
    mrp: 0,
    sellingPrice: 0,
    discountPercent: 0,
    images: [],
    featuredImage: "",
    status: "active",
  });

  const websiteCategories = ["Batter Mix", "Spices", "Chutney Mix", "Honey", "Masala", "Cold Pressed Oil"];
  const gstCategories = ["Food - Batter Mix","Food - Spices","Food - Chutney Mix","Food - Honey","Food - Masala","Food - Cold Pressed Oil"];

  /* ================= GET PRODUCTS ================= */
  async function fetchProducts() {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/products");
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= HANDLE INPUT ================= */
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleImageUpload(e, featured = false) {
    const file = e.target.files[0];
    const url = await uploadToCloudinary(file);

    if (featured) {
      setForm({ ...form, featuredImage: url });
    } else {
      setForm({ ...form, images: [...form.images, url] });
    }
  }

  /* ================= ADD / EDIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = editProduct ? "/api/admin/products" : "/api/admin/products";
      const method = editProduct ? "PUT" : "POST";

      const payload = editProduct ? { productId: editProduct._id, updates: form } : form;

      const { data } = await axios({ url: endpoint, method, data: payload });

      if (data.success) {
        fetchProducts();
        setModalOpen(false);
        setEditProduct(null);
        setForm({
          name: "",
          description: "",
          category: "",
          gstCategory: "",
          costPrice: 0,
          mrp: 0,
          sellingPrice: 0,
          discountPercent: 0,
          images: [],
          featuredImage: "",
          status: "active",
        });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  /* ================= EDIT PRODUCT ================= */
  function editHandler(product) {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      gstCategory: product.gstCategory,
      costPrice: product.costPrice,
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      discountPercent: product.discountPercent,
      images: product.images || [],
      featuredImage: product.featuredImage || "",
      status: product.status,
    });
    setModalOpen(true);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>
      <button onClick={() => setModalOpen(true)}>Add Product</button>

      {/* ================= PRODUCTS TABLE ================= */}
      {loading ? <p>Loading...</p> : (
        <table border={1} cellPadding={10} style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>GST Category</th>
              <th>MRP</th>
              <th>Selling Price</th>
              <th>Status</th>
              <th>Featured Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.gstCategory}</td>
                <td>{p.mrp}</td>
                <td>{p.sellingPrice}</td>
                <td>{p.status}</td>
                <td>{p.featuredImage && <Image src={p.featuredImage} width={50} height={50} alt={p.name} />}</td>
                <td>
                  <button onClick={() => editHandler(p)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center"
        }}>
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 20, width: 600, maxHeight: "90vh", overflowY: "scroll" }}>
            <h2>{editProduct ? "Edit Product" : "Add Product"}</h2>

            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />

            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select Website Category</option>
              {websiteCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select name="gstCategory" value={form.gstCategory} onChange={handleChange} required>
              <option value="">Select GST Category</option>
              {gstCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} required />
            <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} required />
            <input name="sellingPrice" type="number" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} required />
            <input name="discountPercent" type="number" placeholder="Discount %" value={form.discountPercent} onChange={handleChange} />

            <label>Featured Image</label>
            <input type="file" onChange={(e) => handleImageUpload(e, true)} />
            {form.featuredImage && <Image src={form.featuredImage} width={100} height={100} alt="featured" />}

            <label>Additional Images</label>
            <input type="file" onChange={handleImageUpload} />
            {form.images.map((img, idx) => <Image key={idx} src={img} width={100} height={100} alt="img" />)}

            <select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
            <button type="button" onClick={() => { setModalOpen(false); setEditProduct(null); }}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
