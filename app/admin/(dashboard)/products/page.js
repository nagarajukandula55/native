"use client";

import { useState } from "react";

/* ================= HELPERS ================= */

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
}

// Extract word after "Native"
function extractCoreWord(name) {
  if (!name) return "";

  const words = name.trim().split(/\s+/);

  if (words[0].toLowerCase() === "native" && words.length > 1) {
    return words[1]; // take only next word
  }

  return words[0]; // fallback
}

function generateSKU(name, products) {
  if (!name) return "";

  const coreWord = extractCoreWord(name).toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (!coreWord) return "";

  const base = `NA${coreWord}`;

  // Find existing SKUs
  const same = products.filter((p) => p.sku?.startsWith(base));

  const nextNumber = same.length + 1;

  return `${base}${String(nextNumber).padStart(3, "0")}`;
}

function generateTags(name, desc) {
  return [...new Set((name + " " + desc).toLowerCase().split(" "))].slice(0, 10);
}

/* ================= COMPONENT ================= */

export default function ProductsPage() {
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
    sku: "",
    tags: [],
    images: [],
    status: "active",
  });

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newGst, setNewGst] = useState({ name: "", hsn: "", gst: "" });

  /* ================= HANDLERS ================= */

  function handleChange(e) {
    const { name, value } = e.target;

    let updated = { ...form, [name]: value };

    if (name === "name" || name === "description") {
      updated.slug = generateSlug(updated.name);
      updated.tags = generateTags(updated.name, updated.description);
      updated.sku = generateSKU(updated.name, products); // ✅ UPDATED SKU
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

  /* ================= CATEGORY ADD ================= */

  function addCategory() {
    if (!newCategory.trim()) return;

    const obj = { _id: Date.now(), name: newCategory.trim() };
    setCategories((p) => [...p, obj]);

    setForm((f) => ({ ...f, category: obj.name }));
    setNewCategory("");
  }

  function addSubcategory() {
    if (!newSubcategory.trim()) return;

    const obj = { _id: Date.now(), name: newSubcategory.trim() };
    setSubcategories((p) => [...p, obj]);

    setForm((f) => ({ ...f, subcategory: obj.name }));
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

  /* ================= UI ================= */

  return (
    <div style={container}>
      <h1 style={{ marginBottom: 20 }}>Product Management</h1>

      <div style={layout}>
        <div style={card}>
          <h2>Add Product</h2>

          <div style={grid}>
            <input name="name" placeholder="Product Name" onChange={handleChange} />

            <input value={form.slug} readOnly placeholder="Slug" />

            <input value={form.sku} readOnly placeholder="SKU (auto)" />

            <input name="brand" placeholder="Brand" onChange={handleChange} />

            {/* CATEGORY */}
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c._id}>{c.name}</option>
              ))}
            </select>

            <div style={inline}>
              <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Add Category" />
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
              <input value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} placeholder="Add Subcategory" />
              <button type="button" onClick={addSubcategory}>+</button>
            </div>

            {/* GST */}
            <select value={form.gstCategory} onChange={handleGstChange}>
              <option value="">GST Category</option>
              {gstCategories.map((c) => (
                <option key={c._id}>{c.name}</option>
              ))}
            </select>

            <input value={form.hsnCode} readOnly placeholder="HSN" />
            <input value={form.gstPercent} readOnly placeholder="GST %" />

            <input name="costPrice" placeholder="Cost Price" onChange={handleChange} />
            <input name="mrp" placeholder="MRP" onChange={handleChange} />
            <input name="sellingPrice" placeholder="Selling Price" onChange={handleChange} />

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

          <input type="file" multiple onChange={handleImage} />

          <div style={{ display: "flex", gap: 10 }}>
            {form.images.map((file, i) => (
              <div key={i}>
                <img src={URL.createObjectURL(file)} width={70} />
                <button onClick={() => removeImage(i)}>X</button>
              </div>
            ))}
          </div>

          <button style={btn}>Save Product</button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const container = {
  padding: 30,
  maxWidth: 1200,
  margin: "auto",
};

const layout = {
  display: "flex",
  gap: 20,
};

const card = {
  flex: 1,
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 10,
};

const inline = {
  display: "flex",
  gap: 5,
};

const btn = {
  marginTop: 15,
  padding: 12,
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 8,
};
