"use client";

import { useState } from "react";

/* ================= HELPERS ================= */

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
}

function generateSKU() {
  return "SKU-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateTags(name, desc) {
  const words = (name + " " + desc).toLowerCase().split(" ");
  return [...new Set(words)].slice(0, 10);
}

/* ================= COMPONENT ================= */

export default function ProductsPage() {
  /* ===== STATE ===== */

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    brand: "",

    category: "",
    subcategory: "",

    gstCategory: "",
    hsnCode: "",
    gstPercent: 0,

    costPrice: "",
    mrp: "",
    sellingPrice: "",

    sku: generateSKU(),
    tags: [],

    images: [],
    status: "active",
  });

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newGst, setNewGst] = useState({ name: "", hsn: "", gst: "" });

  /* ===== HANDLERS ===== */

  function handleChange(e) {
    const { name, value } = e.target;

    const updated = { ...form, [name]: value };

    // AUTO SLUG + TAGS
    if (name === "name" || name === "description") {
      updated.slug = generateSlug(updated.name);
      updated.tags = generateTags(updated.name, updated.description);
    }

    setForm(updated);
  }

  function handleGstChange(e) {
    const selected = gstCategories.find((c) => c.name === e.target.value);

    setForm((p) => ({
      ...p,
      gstCategory: selected?.name || "",
      hsnCode: selected?.hsn || "",
      gstPercent: selected?.gst || 0,
    }));
  }

  function handleImage(e) {
    const files = Array.from(e.target.files);
    setForm((p) => ({ ...p, images: files }));
  }

  function removeImage(i) {
    setForm((p) => ({
      ...p,
      images: p.images.filter((_, idx) => idx !== i),
    }));
  }

  /* ===== CATEGORY ADD (UI ONLY) ===== */

  function addCategory() {
    if (!newCategory) return;

    const obj = { _id: Date.now(), name: newCategory };
    setCategories((p) => [...p, obj]);

    setForm((f) => ({ ...f, category: newCategory }));
    setNewCategory("");
  }

  function addSubcategory() {
    if (!newSubcategory) return;

    const obj = { _id: Date.now(), name: newSubcategory };
    setSubcategories((p) => [...p, obj]);

    setForm((f) => ({ ...f, subcategory: newSubcategory }));
    setNewSubcategory("");
  }

  function addGstCategory() {
    const { name, hsn, gst } = newGst;
    if (!name || !hsn || !gst) return;

    const obj = {
      _id: Date.now(),
      name,
      hsn,
      gst: Number(gst),
    };

    setGstCategories((p) => [...p, obj]);

    setForm((f) => ({
      ...f,
      gstCategory: name,
      hsnCode: hsn,
      gstPercent: gst,
    }));

    setNewGst({ name: "", hsn: "", gst: "" });
  }

  /* ===== UI ===== */

  return (
    <div style={{ padding: 20, maxWidth: 1300, margin: "auto" }}>
      <h1>Product Management</h1>

      <div style={{ display: "flex", gap: 20 }}>
        
        {/* ================= FORM ================= */}
        <div style={{ flex: 2 }}>
          <div style={card}>
            <h2>Add Product</h2>

            <div style={grid}>
              <input name="name" placeholder="Product Name" onChange={handleChange} />

              <input value={form.slug} readOnly placeholder="Slug (auto)" />

              <input name="brand" placeholder="Brand" onChange={handleChange} />

              {/* CATEGORY */}
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id}>{c.name}</option>
                ))}
              </select>

              <div style={inline}>
                <input
                  placeholder="New Category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button type="button" onClick={addCategory}>+</button>
              </div>

              {/* SUBCATEGORY */}
              <select name="subcategory" value={form.subcategory} onChange={handleChange}>
                <option value="">Subcategory</option>
                {subcategories.map((c) => (
                  <option key={c._id}>{c.name}</option>
                ))}
              </select>

              <div style={inline}>
                <input
                  placeholder="New Subcategory"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                />
                <button type="button" onClick={addSubcategory}>+</button>
              </div>

              {/* GST */}
              <select value={form.gstCategory} onChange={handleGstChange}>
                <option>GST Category</option>
                {gstCategories.map((c) => (
                  <option key={c._id}>{c.name}</option>
                ))}
              </select>

              <div style={inline}>
                <input placeholder="Name" value={newGst.name} onChange={(e) => setNewGst({ ...newGst, name: e.target.value })} />
                <input placeholder="HSN" value={newGst.hsn} onChange={(e) => setNewGst({ ...newGst, hsn: e.target.value })} />
                <input placeholder="GST %" value={newGst.gst} onChange={(e) => setNewGst({ ...newGst, gst: e.target.value })} />
                <button type="button" onClick={addGstCategory}>+</button>
              </div>

              <input value={form.hsnCode} readOnly placeholder="HSN" />
              <input value={form.gstPercent} readOnly placeholder="GST %" />

              <input name="costPrice" placeholder="Cost Price" onChange={handleChange} />
              <input name="mrp" placeholder="MRP" onChange={handleChange} />
              <input name="sellingPrice" placeholder="Selling Price" onChange={handleChange} />

              <input value={form.sku} readOnly />

              <select name="status" onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <textarea
              placeholder="Description"
              onChange={(e) =>
                handleChange({ target: { name: "description", value: e.target.value } })
              }
            />

            {/* IMAGES (Cloudinary UI ready) */}
            <input type="file" multiple onChange={handleImage} />

            <div style={{ display: "flex", gap: 10 }}>
              {form.images.map((file, i) => (
                <div key={i}>
                  <img src={URL.createObjectURL(file)} width={60} />
                  <button onClick={() => removeImage(i)}>X</button>
                </div>
              ))}
            </div>

            <button style={btn}>Save Product</button>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div style={{ flex: 1 }}>
          <div style={card}>
            <h3>Products</h3>

            {products.map((p) => (
              <div key={p._id} style={{ borderBottom: "1px solid #ddd", padding: 10 }}>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const inline = {
  display: "flex",
  gap: 5,
};

const btn = {
  marginTop: 10,
  padding: 10,
  background: "#000",
  color: "#fff",
  border: "none",
};
