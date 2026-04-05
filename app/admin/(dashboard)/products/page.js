"use client";

import { useEffect, useState } from "react";

/* ================= HELPERS ================= */

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
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
    images: [],
    status: "active",
  });

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newGst, setNewGst] = useState({ name: "", hsn: "", gst: "" });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [p, c, s, g] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/subcategories").then((r) => r.json()),
      fetch("/api/admin/gst").then((r) => r.json()),
    ]);

    setProducts(p.products || p);
    setCategories(c);
    setSubcategories(s);
    setGstCategories(g);
  }

  /* ================= HANDLERS ================= */

  function handleChange(e) {
    const { name, value } = e.target;

    let updated = { ...form, [name]: value };

    if (name === "name" || name === "description") {
      updated.slug = generateSlug(updated.name);
    }

    setForm(updated);
  }

  function handleGstChange(e) {
    const selected = gstCategories.find((c) => c._id === e.target.value);

    setForm((p) => ({
      ...p,
      gstCategory: selected?._id || "",
      hsnCode: selected?.hsn || "",
      gstPercent: selected?.gst || 0,
    }));
  }

  function handleImage(e) {
    const files = Array.from(e.target.files);
    setForm((p) => ({ ...p, images: files }));
  }

  /* ================= ADD CATEGORY ================= */

  async function addCategory() {
    if (!newCategory.trim()) return;

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: newCategory }),
    });

    const data = await res.json();
    setCategories((p) => [...p, data]);

    setForm((f) => ({ ...f, category: data._id }));
    setNewCategory("");
  }

  async function addSubcategory() {
    if (!newSubcategory.trim() || !form.category) return;

    const res = await fetch("/api/admin/subcategories", {
      method: "POST",
      body: JSON.stringify({
        name: newSubcategory,
        categoryId: form.category,
      }),
    });

    const data = await res.json();
    setSubcategories((p) => [...p, data]);

    setForm((f) => ({ ...f, subcategory: data._id }));
    setNewSubcategory("");
  }

  async function addGstCategory() {
    const { name, hsn, gst } = newGst;
    if (!name || !hsn || !gst) return;

    const res = await fetch("/api/admin/gst", {
      method: "POST",
      body: JSON.stringify({ name, hsn, gst }),
    });

    const data = await res.json();
    setGstCategories((p) => [...p, data]);

    setForm((f) => ({
      ...f,
      gstCategory: data._id,
      hsnCode: data.hsn,
      gstPercent: data.gst,
    }));

    setNewGst({ name: "", hsn: "", gst: "" });
  }

  /* ================= SAVE PRODUCT ================= */

  async function saveProduct() {
    const fd = new FormData();

    Object.keys(form).forEach((key) => {
      if (key !== "images") fd.append(key, form[key]);
    });

    form.images.forEach((img) => fd.append("images", img));

    const res = await fetch("/api/admin/products", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();

    if (res.ok) {
      alert("Product saved");
      fetchAll();
    } else {
      alert(data.error || "Error");
    }
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 30 }}>
      <h1>Product Management</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input value={form.slug} readOnly placeholder="Slug" />

        <input name="brand" placeholder="Brand" onChange={handleChange} />

        {/* CATEGORY */}
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Add Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={addCategory}>Add</button>

        {/* SUBCATEGORY */}
        <select name="subcategory" value={form.subcategory} onChange={handleChange}>
          <option value="">Subcategory</option>
          {subcategories
            .filter((s) => s.category?._id === form.category)
            .map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
        </select>

        <input
          placeholder="Add Subcategory"
          value={newSubcategory}
          onChange={(e) => setNewSubcategory(e.target.value)}
        />
        <button onClick={addSubcategory}>Add</button>

        {/* GST */}
        <select value={form.gstCategory} onChange={handleGstChange}>
          <option value="">GST</option>
          {gstCategories.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>

        <input value={form.hsnCode} readOnly placeholder="HSN" />
        <input value={form.gstPercent} readOnly placeholder="GST %" />

        <input
          placeholder="GST Name"
          value={newGst.name}
          onChange={(e) => setNewGst({ ...newGst, name: e.target.value })}
        />
        <input
          placeholder="HSN"
          value={newGst.hsn}
          onChange={(e) => setNewGst({ ...newGst, hsn: e.target.value })}
        />
        <input
          placeholder="GST %"
          value={newGst.gst}
          onChange={(e) => setNewGst({ ...newGst, gst: e.target.value })}
        />
        <button onClick={addGstCategory}>Add</button>

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

      <button onClick={saveProduct} style={{ marginTop: 20 }}>
        Save Product
      </button>
    </div>
  );
}
