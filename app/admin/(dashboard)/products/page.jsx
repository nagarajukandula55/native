"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  /* ================= FETCH PRODUCTS ================= */
  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (Array.isArray(data)) setProducts(data);
    else if (Array.isArray(data.data)) setProducts(data.data);
    else setProducts([]);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      />

      <ProductForm
        refresh={fetchProducts}
        editing={editing}
        setEditing={setEditing}
      />

      <ProductTable
        products={filtered}
        refresh={fetchProducts}
        setEditing={setEditing}
      />
    </div>
  );
}

/* ================= PRODUCT FORM ================= */
function ProductForm({ refresh, editing, setEditing }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);

  const [previewImages, setPreviewImages] = useState([]);
  const [variants, setVariants] = useState([]);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    category: "",
    subcategory: "",
    gstCategory: "",
    hsnCode: "",
    gstPercent: 0,
    costPrice: 0,
    mrp: 0,
    sellingPrice: 0,
    status: "active",
    sku: "",
    images: [],
  });

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newGstCategory, setNewGstCategory] = useState({ name: "", gst: 0, hsn: "" });

  /* ================= LOAD ALL CATEGORIES ================= */
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [c, s, g] = await Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/subcategories").then((r) => r.json()),
      fetch("/api/admin/gst").then((r) => r.json()),
    ]);

    setCategories(Array.isArray(c) ? c : c.data || []);
    setSubcategories(Array.isArray(s) ? s : s.data || []);
    setGstCategories(Array.isArray(g) ? g : g.data || []);
  }

  /* ================= EDIT MODE ================= */
  useEffect(() => {
    if (editing) {
      setForm(editing);
      setVariants(editing.variants || []);
    }
  }, [editing]);

  function handleChange(e) {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  /* ================= GST AUTO ================= */
  function handleGst(e) {
    const g = gstCategories.find((x) => x._id === e.target.value);
    if (!g) return;
    setForm({
      ...form,
      gstCategory: g._id,
      hsnCode: g.hsn,
      gstPercent: g.gst,
    });
  }

  /* ================= SKU AUTO ================= */
  useEffect(() => {
    if (!form.name) return;
    const firstWord = form.name.split(" ")[0];
    setForm((f) => ({ ...f, sku: "NA" + firstWord.toUpperCase() }));
  }, [form.name]);

  /* ================= PROFIT + GST ================= */
  const cost = Number(form.costPrice) || 0;
  const selling = Number(form.sellingPrice) || 0;
  const gstPercent = Number(form.gstPercent) || 0;
  const gstAmount = (selling * gstPercent) / 100;
  const profit = selling - cost;

  /* ================= IMAGE PREVIEW ================= */
  function handleImages(e) {
    const files = [...e.target.files];
    setForm({ ...form, images: files });
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  }

  /* ================= VARIANTS ================= */
  function addVariant() {
    setVariants([
      ...variants,
      { type: "", value: "", cost: 0, price: 0, sku: "", stock: 0 },
    ]);
  }

  function updateVariant(i, field, value) {
    const updated = [...variants];
    updated[i][field] =
      field === "cost" || field === "price" || field === "stock"
        ? Number(value)
        : value;
    if (field === "value") updated[i].sku = form.sku + value.toUpperCase();
    setVariants(updated);
  }

  function removeVariant(i) {
    setVariants(variants.filter((_, idx) => idx !== i));
  }

  /* ================= INLINE ADD CATEGORY ================= */
  async function addCategory() {
    if (!newCategory) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: newCategory }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setCategories([...categories, data]);
    setForm({ ...form, category: data._id });
    setNewCategory("");
  }

  async function addSubcategory() {
    if (!newSubcategory || !form.category) return;
    const res = await fetch("/api/admin/subcategories", {
      method: "POST",
      body: JSON.stringify({ name: newSubcategory, category: form.category }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setSubcategories([...subcategories, data]);
    setForm({ ...form, subcategory: data._id });
    setNewSubcategory("");
  }

  async function addGstCategory() {
    if (!newGstCategory.name) return;
    const res = await fetch("/api/admin/gst", {
      method: "POST",
      body: JSON.stringify(newGstCategory),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setGstCategories([...gstCategories, data]);
    setForm({ ...form, gstCategory: data._id, hsnCode: data.hsn, gstPercent: data.gst });
    setNewGstCategory({ name: "", gst: 0, hsn: "" });
  }

  /* ================= SAVE PRODUCT ================= */
  async function save() {
    const fd = new FormData();
    Object.keys(form).forEach((k) => {
      if (k !== "images") fd.append(k, form[k]);
    });

    if (Array.isArray(form.images)) {
      form.images.forEach((img) => {
        if (img instanceof File) fd.append("images", img);
      });
    }

    fd.append("variants", JSON.stringify(variants));

    await fetch("/api/admin/products", {
      method: editing ? "PUT" : "POST",
      body: fd,
    });

    setEditing(null);
    refresh();
  }

  return (
    <div style={box}>
      <h2>{editing ? "Edit Product" : "Add Product"}</h2>

      {/* BASIC */}
      <div style={grid}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="brand"
          placeholder="Brand"
          value={form.brand}
          onChange={handleChange}
        />
        <input placeholder="SKU" value={form.sku} readOnly />
      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      {/* CATEGORY WITH INLINE ADD */}
      <div style={grid}>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input
          placeholder="Add Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={addCategory}>+ Add</button>
      </div>

      <div style={grid}>
        <select
          name="subcategory"
          value={form.subcategory}
          onChange={handleChange}
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <input
          placeholder="Add Subcategory"
          value={newSubcategory}
          onChange={(e) => setNewSubcategory(e.target.value)}
        />
        <button onClick={addSubcategory}>+ Add</button>
      </div>

      <div style={grid}>
        <select value={form.gstCategory} onChange={handleGst}>
          <option value="">GST Category</option>
          {gstCategories.map((g) => (
            <option key={g._id} value={g._id}>{g.name}</option>
          ))}
        </select>
        <input
          placeholder="Add GST Name"
          value={newGstCategory.name}
          onChange={(e) =>
            setNewGstCategory({ ...newGstCategory, name: e.target.value })
          }
        />
        <input
          placeholder="GST %"
          type="number"
          value={newGstCategory.gst}
          onChange={(e) =>
            setNewGstCategory({ ...newGstCategory, gst: Number(e.target.value) })
          }
        />
        <input
          placeholder="HSN"
          value={newGstCategory.hsn}
          onChange={(e) =>
            setNewGstCategory({ ...newGstCategory, hsn: e.target.value })
          }
        />
        <button onClick={addGstCategory}>+ Add</button>
      </div>

      {/* PRICING */}
      <div style={grid}>
        <input
          type="number"
          name="costPrice"
          placeholder="Cost Price"
          value={form.costPrice}
          onChange={handleChange}
        />
        <input
          type="number"
          name="mrp"
          placeholder="MRP"
          value={form.mrp}
          onChange={handleChange}
        />
        <input
          type="number"
          name="sellingPrice"
          placeholder="Selling Price"
          value={form.sellingPrice}
          onChange={handleChange}
        />
      </div>

      <div>
        <b>Profit:</b> ₹ {profit.toFixed(2)} | <b>GST:</b> ₹ {gstAmount.toFixed(2)}
      </div>

      {/* VARIANTS */}
      <h3>Variants</h3>
      {variants.map((v, i) => (
        <div key={i} style={variantRow}>
          <input
            placeholder="Type"
            value={v.type}
            onChange={(e) => updateVariant(i, "type", e.target.value)}
          />
          <input
            placeholder="Value"
            value={v.value}
            onChange={(e) => updateVariant(i, "value", e.target.value)}
          />
          <input
            placeholder="Cost"
            type="number"
            value={v.cost}
            onChange={(e) => updateVariant(i, "cost", e.target.value)}
          />
          <input
            placeholder="Price"
            type="number"
            value={v.price}
            onChange={(e) => updateVariant(i, "price", e.target.value)}
          />
          <input
            placeholder="Stock"
            type="number"
            value={v.stock}
            onChange={(e) => updateVariant(i, "stock", e.target.value)}
          />
          <input placeholder="SKU" value={v.sku} readOnly />
          <span>₹ {(v.price - v.cost).toFixed(2)}</span>
          <button onClick={() => removeVariant(i)}>X</button>
        </div>
      ))}
      <button onClick={addVariant}>+ Add Variant</button>

      {/* IMAGES */}
      <h3>Images</h3>
      <input type="file" multiple onChange={handleImages} />
      <div style={{ display: "flex", gap: 10 }}>
        {previewImages.map((src, i) => (
          <img key={i} src={src} width={60} />
        ))}
      </div>

      <button onClick={save} style={btn}>
        Save Product
      </button>
    </div>
  );
}

/* ================= PRODUCT TABLE ================= */
function ProductTable({ products, refresh, setEditing }) {
  async function del(id) {
    await fetch("/api/admin/products?id=" + id, { method: "DELETE" });
    refresh();
  }

  return (
    <table width="100%" border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Name</th>
          <th>SKU</th>
          <th>Variants</th>
          <th>Profit</th>
          <th>GST</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {products.map((p) => (
          <tr key={p._id}>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>{p.variants?.length || 0}</td>
            <td>₹ {((p.sellingPrice || 0) - (p.costPrice || 0)).toFixed(2)}</td>
            <td>₹ {(((p.sellingPrice || 0) * (p.gstPercent || 0)) / 100).toFixed(2)}</td>
            <td>{p.status}</td>
            <td>
              <button onClick={() => setEditing(p)}>Edit</button>
              <button onClick={() => del(p._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ================= STYLES ================= */
const box = { background: "#fff", padding: 20, marginBottom: 20 };
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 10,
  marginBottom: 10,
};
const variantRow = { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" };
const btn = { background: "black", color: "#fff", padding: 10, marginTop: 10, cursor: "pointer" };
