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

  /* ================= LOAD ================= */
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [c, s, g] = await Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/subcategories").then((r) => r.json()),
      fetch("/api/admin/gst").then((r) => r.json()),
    ]);

    setCategories(c);
    setSubcategories(s);
    setGstCategories(g);
  }

  /* ================= EDIT ================= */
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

  /* ================= HANDLERS ================= */

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleGstChange(e) {
    const selected = gstCategories.find((g) => g._id === e.target.value);

    setForm({
      ...form,
      gstCategory: selected?._id,
      hsnCode: selected?.hsn,
      gstPercent: selected?.gst,
    });
  }

  function handleImage(e) {
    setForm({ ...form, images: Array.from(e.target.files) });
  }

  /* ================= SAVE ================= */

  async function submit() {
    const fd = new FormData();

    Object.keys(form).forEach((k) => {
      if (k !== "images") fd.append(k, form[k]);
    });

    form.images.forEach((img) => fd.append("images", img));

    if (editing) fd.append("_id", editing._id);

    await fetch("/api/admin/products", {
      method: editing ? "PUT" : "POST",
      body: fd,
    });

    setEditing(null);
    refresh();
  }

  /* ================= UI ================= */

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold">
        {editing ? "Edit Product" : "Add Product"}
      </h2>

      <div className="grid grid-cols-3 gap-4">

        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />

        {/* CATEGORY */}
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* SUBCATEGORY */}
        <select name="subcategory" value={form.subcategory} onChange={handleChange}>
          <option value="">Subcategory</option>
          {subcategories
            .filter((s) => s.category?._id === form.category)
            .map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
        </select>

        {/* GST */}
        <select value={form.gstCategory} onChange={handleGstChange}>
          <option value="">GST Category</option>
          {gstCategories.map((g) => (
            <option key={g._id} value={g._id}>{g.name}</option>
          ))}
        </select>

        <input value={form.hsnCode} readOnly placeholder="HSN Code" />
        <input value={form.gstPercent} readOnly placeholder="GST %" />

        <input name="costPrice" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />
        <input name="mrp" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="sellingPrice" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <input type="file" multiple onChange={handleImage} />

      <button
        onClick={submit}
        className="bg-black text-white px-6 py-2 rounded-xl"
      >
        {editing ? "Update Product" : "Create Product"}
      </button>
    </div>
  );
}
