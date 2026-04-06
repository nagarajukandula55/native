"use client";

import { useEffect, useState } from "react";

export default function ProductForm({ refresh, editing, setEditing }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    brand: "",
    category: "",
    subcategory: "",
    gstCategory: "",
    hsnCode: "",
    gstPercent: "",
    costPrice: "",
    mrp: "",
    sellingPrice: "",
    status: "active",
    images: [],
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [c, s, g] = await Promise.all([
      fetch("/api/admin/categories").then(r => r.json()),
      fetch("/api/admin/subcategories").then(r => r.json()),
      fetch("/api/admin/gst").then(r => r.json())
    ]);
    setCategories(c);
    setSubcategories(s);
    setGstCategories(g);
  }

  useEffect(() => {
    if (editing) {
      setForm({
        ...editing,
        category: editing.category?._id,
        subcategory: editing.subcategory?._id,
        gstCategory: editing.gstCategory?._id,
      });
    }
  }, [editing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleGst(e) {
    const g = gstCategories.find(x => x._id === e.target.value);
    setForm({
      ...form,
      gstCategory: g?._id,
      hsnCode: g?.hsn,
      gstPercent: g?.gst
    });
  }

  async function save() {
    const fd = new FormData();

    Object.keys(form).forEach(k => {
      if (k !== "images") fd.append(k, form[k]);
    });

    form.images.forEach(img => fd.append("images", img));

    if (editing) fd.append("_id", editing._id);

    await fetch("/api/admin/products", {
      method: editing ? "PUT" : "POST",
      body: fd
    });

    setEditing(null);
    refresh();
  }

  return (
    <div style={card}>
      <h2 style={title}>
        {editing ? "Edit Product" : "Add Product"}
      </h2>

      {/* BASIC */}
      <Section title="Basic Info">
        <Grid>
          <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />
          <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
        </Grid>

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </Section>

      {/* CATEGORY + GST */}
      <Section title="Category & GST">
        <Grid>
          <select name="category" value={form.category} onChange={handleChange}>
            <option>Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select name="subcategory" value={form.subcategory} onChange={handleChange}>
            <option>Subcategory</option>
            {subcategories
              .filter(s => s.category?._id === form.category)
              .map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <select value={form.gstCategory} onChange={handleGst}>
            <option>GST Category</option>
            {gstCategories.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>

          <input value={form.hsnCode} readOnly placeholder="HSN Code" />
          <input value={form.gstPercent} readOnly placeholder="GST %" />
        </Grid>
      </Section>

      {/* PRICING */}
      <Section title="Pricing">
        <Grid>
          <input name="costPrice" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />
          <input name="mrp" placeholder="MRP" value={form.mrp} onChange={handleChange} />
          <input name="sellingPrice" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </Grid>
      </Section>

      {/* MEDIA */}
      <Section title="Images">
        <input type="file" multiple onChange={e => setForm({ ...form, images: [...e.target.files] })} />
      </Section>

      <button style={primaryBtn} onClick={save}>
        {editing ? "Update Product" : "Save Product"}
      </button>
    </div>
  );
}

/* ===== UI HELPERS ===== */

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ marginBottom: 10, fontWeight: 600 }}>{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const title = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 20,
};

const primaryBtn = {
  background: "#000",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  cursor: "pointer",
};
