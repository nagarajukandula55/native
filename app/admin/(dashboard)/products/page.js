"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    _id: null,
    name: "",
    category: "",
    gstCategory: "",
    price: 0,
    mrp: 0,
    costPrice: 0,
    discount: 0,
    hsn: "",
    gst: 0,
    images: [],
    description: "",
    highlights: "",
    active: true,
  });

  /* ================= FETCH CATEGORIES ================= */
  async function fetchCategories() {
    try {
      const { data } = await axios.get("/api/admin/categories");
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= FETCH PRODUCTS ================= */
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
    fetchCategories();
    fetchProducts();
  }, []);

  /* ================= HANDLE FORM CHANGE ================= */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* ================= HANDLE IMAGE UPLOAD ================= */
  async function handleImageUpload(e) {
    const files = e.target.files;
    const urls = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      urls.push(data.secure_url);
    }

    setForm((prev) => ({ ...prev, images: urls }));
  }

  /* ================= ADD / UPDATE PRODUCT ================= */
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (form._id) {
        await axios.put(`/api/admin/products`, form);
      } else {
        await axios.post(`/api/admin/products`, form);
      }

      setForm({
        _id: null,
        name: "",
        category: "",
        gstCategory: "",
        price: 0,
        mrp: 0,
        costPrice: 0,
        discount: 0,
        hsn: "",
        gst: 0,
        images: [],
        description: "",
        highlights: "",
        active: true,
      });

      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= EDIT PRODUCT ================= */
  function editProduct(prod) {
    setForm({
      _id: prod._id,
      name: prod.name,
      category: prod.category,
      gstCategory: prod.gstCategory,
      price: prod.price,
      mrp: prod.mrp,
      costPrice: prod.costPrice,
      discount: prod.discount,
      hsn: prod.hsn,
      gst: prod.gst,
      images: prod.images || [],
      description: prod.description || "",
      highlights: prod.highlights || "",
      active: prod.active,
    });
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 20 }}>Admin Products</h1>

      {/* ===== ADD / EDIT FORM ===== */}
      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: 40, display: "grid", gap: 15, gridTemplateColumns: "1fr 1fr", alignItems: "center" }}
      >
        <input placeholder="Name" name="name" value={form.name} onChange={handleChange} required />
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Website Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <select name="gstCategory" value={form.gstCategory} onChange={handleChange} required>
          <option value="">Select GST Category</option>
          {categories.map((cat) => cat.gstOptions?.map((gstOpt, idx) => (
            <option key={cat._id + "-" + idx} value={gstOpt.name}>{gstOpt.name} - {gstOpt.hsn} ({gstOpt.gst}%)</option>
          )))}
        </select>
        <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Selling Price" required />
        <input type="number" name="mrp" value={form.mrp} onChange={handleChange} placeholder="MRP" required />
        <input type="number" name="costPrice" value={form.costPrice} onChange={handleChange} placeholder="Cost Price" />
        <input type="number" name="discount" value={form.discount} onChange={handleChange} placeholder="Discount %" />
        <input type="text" name="hsn" value={form.hsn} onChange={handleChange} placeholder="HSN (auto if empty)" />
        <input type="number" name="gst" value={form.gst} onChange={handleChange} placeholder="GST %" />
        <textarea placeholder="Highlights / Description" name="highlights" value={form.highlights} onChange={handleChange} style={{ gridColumn: "1 / 3" }} />
        <textarea placeholder="Detailed Description" name="description" value={form.description} onChange={handleChange} style={{ gridColumn: "1 / 3" }} />
        <input type="file" multiple onChange={handleImageUpload} />
        <label style={{ gridColumn: "1 / 3" }}>
          <input type="checkbox" checked={form.active} onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))} />
          Active
        </label>
        <button type="submit" style={{ gridColumn: "1 / 3", padding: 12 }}>
          {form._id ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* ===== PRODUCTS TABLE ===== */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Website Category</th>
              <th>GST Category</th>
              <th>Price</th>
              <th>MRP</th>
              <th>Cost</th>
              <th>Discount %</th>
              <th>HSN</th>
              <th>GST %</th>
              <th>Active</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  {p.images && p.images[0] ? <img src={p.images[0]} width={50} height={50} style={{ objectFit: "cover" }} /> : "No Image"}
                </td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.gstCategory}</td>
                <td>{p.price}</td>
                <td>{p.mrp}</td>
                <td>{p.costPrice}</td>
                <td>{p.discount}</td>
                <td>{p.hsn}</td>
                <td>{p.gst}</td>
                <td>{p.active ? "Yes" : "No"}</td>
                <td><button onClick={() => editProduct(p)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
