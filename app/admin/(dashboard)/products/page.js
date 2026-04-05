"use client";

import { useEffect, useState } from "react";
import { HSN_LIST } from "@/lib/hsn";
import { CATEGORIES } from "@/lib/category";

export default function AdminProducts() {

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    mrp: "",
    costPrice: "",
    category: "",
    brand: "",
    hsn: "",
    gst: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    featured: false,
    status: "ACTIVE",
    image: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }

    } catch (err) {
      console.error(err);
      alert("Failed to load products");
    }
    setLoading(false);
  }

  /* ================= FORM CHANGE ================= */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    let updated = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };

    if (name === "hsn") {
      const selected = HSN_LIST.find(h => h.hsn === value);
      if (selected) updated.gst = selected.gst;
    }

    setForm(updated);
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.price) {
      return alert("Name & Price required");
    }

    setSaving(true);

    try {
      let res;

      if (editing) {
        res = await fetch(`/api/admin/products/${form.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed");
      } else {
        alert(editing ? "Updated ✅" : "Created ✅");
        setForm(emptyForm);
        setEditing(false);
        loadProducts();
      }

    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }

    setSaving(false);
  }

  /* ================= EDIT ================= */
  function editProduct(p) {
    setForm(p);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ================= DELETE ================= */
  async function deleteProduct(slug) {
    if (!confirm("Delete this product?")) return;

    await fetch(`/api/admin/products?slug=${slug}`, {
      method: "DELETE",
    });

    loadProducts();
  }

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        🛍 Product Management
      </h1>

      {/* ================= FORM ================= */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Category</option>
          {CATEGORIES.map(c => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>

        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />

        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
        <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />

        <select name="hsn" value={form.hsn} onChange={handleChange}>
          <option value="">HSN</option>
          {HSN_LIST.map(h => (
            <option key={h.hsn} value={h.hsn}>
              {h.hsn} - GST {h.gst}%
            </option>
          ))}
        </select>

        <input name="gst" placeholder="GST" value={form.gst} onChange={handleChange} />

        <input name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} />
        <input name="length" placeholder="Length" value={form.length} onChange={handleChange} />
        <input name="breadth" placeholder="Breadth" value={form.breadth} onChange={handleChange} />
        <input name="height" placeholder="Height" value={form.height} onChange={handleChange} />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={{ gridColumn: "span 2" }}
        />

        <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} style={{ gridColumn: "span 2" }} />

        <label style={{ gridColumn: "span 2" }}>
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
          Featured
        </label>

        <button style={{ gridColumn: "span 2", padding: 12, background: "#111", color: "#fff" }}>
          {saving ? "Saving..." : editing ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* ================= LIST ================= */}
      {loading ? (
        <p style={{ marginTop: 20 }}>Loading...</p>
      ) : (
        <div style={{ marginTop: 30 }}>
          {products.map(p => (
            <div key={p._id} style={{
              border: "1px solid #eee",
              padding: 15,
              marginBottom: 10,
              borderRadius: 8
            }}>
              <strong>{p.name}</strong> — ₹{p.price}
              <br />
              SKU: {p.sku}

              <div style={{ marginTop: 10 }}>
                <button onClick={() => editProduct(p)}>Edit</button>
                <button onClick={() => deleteProduct(p.slug)} style={{ marginLeft: 10 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
