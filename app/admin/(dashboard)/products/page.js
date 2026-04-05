"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    _id: "",
    name: "",
    category: "",
    subCategory: "",
    price: "",
    costPrice: "",
    mrp: "",
    discount: 0,
    hsn: "",
    gstPercent: 0,
    description: "",
    images: [],
    active: true,
  });

  const router = useRouter();

  // Fetch products
  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (data.success) setProducts(data.products);
  }

  useEffect(() => { fetchProducts(); }, []);

  // Handle form change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle image upload
  const handleImages = async (e) => {
    const files = Array.from(e.target.files);
    const urls = await Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }));
    setForm({ ...form, images: urls });
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setFormOpen(false);
      setForm({
        _id: "",
        name: "",
        category: "",
        subCategory: "",
        price: "",
        costPrice: "",
        mrp: "",
        discount: 0,
        hsn: "",
        gstPercent: 0,
        description: "",
        images: [],
        active: true,
      });
      fetchProducts();
    }
    setLoading(false);
  };

  const handleEdit = (p) => { setForm({ ...p }); setFormOpen(true); };

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>
      <button onClick={() => setFormOpen(true)}>Add Product</button>

      {formOpen && (
        <form onSubmit={handleSubmit} style={{ margin: "20px 0", border: "1px solid #ccc", padding: 20 }}>
          <input placeholder="Name" name="name" value={form.name} onChange={handleChange} required />
          <input placeholder="Category" name="category" value={form.category} onChange={handleChange} required />
          <input placeholder="Sub Category" name="subCategory" value={form.subCategory} onChange={handleChange} required />
          <input placeholder="Price" name="price" type="number" value={form.price} onChange={handleChange} required />
          <input placeholder="Cost Price" name="costPrice" type="number" value={form.costPrice} onChange={handleChange} required />
          <input placeholder="MRP" name="mrp" type="number" value={form.mrp} onChange={handleChange} required />
          <input placeholder="Discount %" name="discount" type="number" value={form.discount} onChange={handleChange} />
          <input placeholder="HSN" name="hsn" value={form.hsn} onChange={handleChange} required />
          <input placeholder="GST %" name="gstPercent" type="number" value={form.gstPercent} onChange={handleChange} required />
          <textarea placeholder="Description" name="description" value={form.description} onChange={handleChange}></textarea>
          <input type="file" multiple accept="image/*" onChange={handleImages} />
          {form.images.map((img, i) => <img key={i} src={img} style={{ width: 50, marginRight: 5 }} />)}
          <label>
            Active:
            <input type="checkbox" checked={form.active} onChange={() => setForm({ ...form, active: !form.active })} />
          </label>
          <button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Product"}</button>
          <button type="button" onClick={() => setFormOpen(false)}>Cancel</button>
        </form>
      )}

      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category / Sub</th>
            <th>Price</th>
            <th>MRP</th>
            <th>Discount</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.images[0] && <img src={p.images[0]} width={50} />}</td>
              <td>{p.name}</td>
              <td>{p.category} / {p.subCategory}</td>
              <td>{p.price}</td>
              <td>{p.mrp}</td>
              <td>{p.discount}</td>
              <td>{p.active ? "Yes" : "No"}</td>
              <td><button onClick={() => handleEdit(p)}>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
