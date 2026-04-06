"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

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

  const filtered = Array.isArray(products)
    ? products.filter(p =>
        p?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div>
      <input
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      />

      <ProductForm refresh={fetchProducts} editing={editing} setEditing={setEditing} />

      <ProductTable products={filtered} refresh={fetchProducts} setEditing={setEditing} />
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
    gstPercent: "",
    costPrice: "",
    mrp: "",
    sellingPrice: "",
    stock: "",
    sku: "",
    status: "active",
    images: [],
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [c, s, g] = await Promise.all([
      fetch("/api/admin/categories").then(r => r.json()),
      fetch("/api/admin/subcategories").then(r => r.json()),
      fetch("/api/admin/gst").then(r => r.json()),
    ]);

    setCategories(Array.isArray(c) ? c : c.data || []);
    setSubcategories(Array.isArray(s) ? s : s.data || []);
    setGstCategories(Array.isArray(g) ? g : g.data || []);
  }

  useEffect(() => {
    if (editing) {
      setForm(editing);
      setVariants(editing.variants || []);
    }
  }, [editing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleGst(e) {
    const g = gstCategories.find(x => x._id === e.target.value);
    if (!g) return;

    setForm({
      ...form,
      gstCategory: g._id,
      hsnCode: g.hsn,
      gstPercent: g.gst,
    });
  }

  /* SKU AUTO */
  useEffect(() => {
    if (!form.name) return;
    const base = form.name.split(" ")[0];
    setForm(f => ({ ...f, sku: "NA-" + base.toUpperCase() }));
  }, [form.name]);

  /* ===== VARIANTS SYSTEM ===== */

  function addVariant() {
    setVariants([
      ...variants,
      {
        type: "",
        value: "",
        price: "",
        cost: "",
        stock: "",
        sku: "",
      },
    ]);
  }

  function updateVariant(i, field, value) {
    const updated = [...variants];
    updated[i][field] = value;

    // auto SKU
    if (field === "value") {
      updated[i].sku = form.sku + "-" + value.toUpperCase();
    }

    setVariants(updated);
  }

  function removeVariant(i) {
    setVariants(variants.filter((_, index) => index !== i));
  }

  /* ===== IMAGE PREVIEW ===== */

  function handleImages(e) {
    const files = [...e.target.files];
    setForm({ ...form, images: files });

    const previews = files.map(f => URL.createObjectURL(f));
    setPreviewImages(previews);
  }

  /* ===== SAVE ===== */

  async function save() {
    const fd = new FormData();

    Object.keys(form).forEach(k => {
      if (k !== "images") fd.append(k, form[k]);
    });

    // images
    if (Array.isArray(form.images)) {
      form.images.forEach(img => {
        if (img instanceof File) fd.append("images", img);
      });
    }

    // variants
    fd.append("variants", JSON.stringify(variants));

    await fetch("/api/admin/products", {
      method: editing ? "PUT" : "POST",
      body: fd,
    });

    setEditing(null);
    refresh();
  }

  return (
    <div style={{ background: "#fff", padding: 20, marginBottom: 20 }}>
      <h2>{editing ? "Edit Product" : "Add Product"}</h2>

      {/* BASIC */}
      <div style={grid}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
        <input value={form.sku} readOnly placeholder="SKU" />
      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />

      {/* PRICING */}
      <div style={grid}>
        <input name="costPrice" placeholder="Cost" value={form.costPrice} onChange={handleChange} />
        <input name="sellingPrice" placeholder="Selling" value={form.sellingPrice} onChange={handleChange} />
        <input name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />
      </div>

      {/* PROFIT */}
      <div style={{ fontWeight: 600 }}>
        Profit: ₹ {form.sellingPrice - form.costPrice || 0}
      </div>

      {/* VARIANTS */}
      <h3>Variants</h3>

      {variants.map((v, i) => {
        const profit = v.price && v.cost ? v.price - v.cost : 0;

        return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input placeholder="Type" value={v.type} onChange={e => updateVariant(i, "type", e.target.value)} />
            <input placeholder="Value" value={v.value} onChange={e => updateVariant(i, "value", e.target.value)} />
            <input placeholder="Cost" value={v.cost} onChange={e => updateVariant(i, "cost", e.target.value)} />
            <input placeholder="Price" value={v.price} onChange={e => updateVariant(i, "price", e.target.value)} />
            <input placeholder="Stock" value={v.stock} onChange={e => updateVariant(i, "stock", e.target.value)} />
            <input placeholder="SKU" value={v.sku} readOnly />
            <span>₹{profit}</span>
            <button onClick={() => removeVariant(i)}>X</button>
          </div>
        );
      })}

      <button onClick={addVariant}>+ Add Variant</button>

      {/* IMAGES */}
      <h3>Images</h3>
      <input type="file" multiple onChange={handleImages} />

      <div style={{ display: "flex", gap: 10 }}>
        {previewImages.map((src, i) => (
          <img key={i} src={src} width={60} height={60} />
        ))}
      </div>

      <button onClick={save} style={btn}>
        Save Product
      </button>
    </div>
  );
}

/* ================= TABLE ================= */

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
          <th>Stock</th>
          <th>Variants</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {(products || []).map(p => (
          <tr key={p._id}>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>{p.stock}</td>
            <td>{p.variants?.length || 0}</td>
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

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 10,
  marginBottom: 10,
};

const btn = {
  background: "black",
  color: "#fff",
  padding: 10,
  marginTop: 10,
};
