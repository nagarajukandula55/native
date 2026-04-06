"use client";

import { useEffect, useState } from "react";

/* ================= MAIN ================= */

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || data.data || data || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products.filter(p =>
    p?.name?.toLowerCase().includes(search.toLowerCase())
  );

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

/* ================= FORM ================= */

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

  /* MODALS */
  const [showCatModal, setShowCatModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showGstModal, setShowGstModal] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newGst, setNewGst] = useState({ name: "", gst: "", hsn: "" });

  /* LOAD */
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [c, s, g] = await Promise.all([
      fetch("/api/admin/categories").then(r => r.json()),
      fetch("/api/admin/subcategories").then(r => r.json()),
      fetch("/api/admin/gst").then(r => r.json()),
    ]);

    setCategories(c.categories || c.data || c || []);
    setSubcategories(s.subcategories || s.data || s || []);
    setGstCategories(g.gst || g.data || g || []);
  }

  /* EDIT */
  useEffect(() => {
    if (editing) {
      setForm(editing);
      setVariants(editing.variants || []);
    }
  }, [editing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* GST AUTO */
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

  /* PROFIT */
  const profit =
    form.sellingPrice && form.costPrice
      ? (Number(form.sellingPrice) - Number(form.costPrice)).toFixed(2)
      : 0;

  /* IMAGE */
  function handleImages(e) {
    const files = [...e.target.files];
    setForm({ ...form, images: files });
    setPreviewImages(files.map(f => URL.createObjectURL(f)));
  }

  /* VARIANTS */
  function addVariant() {
    setVariants([...variants, { type: "", value: "", cost: "", price: "", stock: "", sku: "" }]);
  }

  function updateVariant(i, field, value) {
    const updated = [...variants];
    updated[i][field] = value;

    if (field === "value") {
      updated[i].sku = form.sku + "-" + value.toUpperCase();
    }

    setVariants(updated);
  }

  function removeVariant(i) {
    setVariants(variants.filter((_, idx) => idx !== i));
  }

  /* VALIDATION */
  function validateForm() {
    const required = [
      "name",
      "brand",
      "category",
      "subcategory",
      "gstCategory",
      "costPrice",
      "mrp",
      "sellingPrice",
    ];

    for (let f of required) {
      if (!form[f]) {
        alert(f + " is required");
        return false;
      }
    }

    if (Number(form.sellingPrice) < Number(form.costPrice)) {
      alert("Selling < Cost not allowed");
      return false;
    }

    if (variants.length === 0) {
      alert("Add at least 1 variant");
      return false;
    }

    for (let v of variants) {
      if (!v.type || !v.value || !v.price || !v.stock) {
        alert("Complete all variant fields");
        return false;
      }
    }

    return true;
  }

  /* CREATE */
  async function createCategory() {
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    setNewCategory("");
    setShowCatModal(false);
    loadAll();
  }

  async function createSubcategory() {
    if (!form.category) return alert("Select category first");

    await fetch("/api/admin/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSubcategory, category: form.category }),
    });

    setNewSubcategory("");
    setShowSubModal(false);
    loadAll();
  }

  async function createGst() {
    await fetch("/api/admin/gst", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGst),
    });

    setNewGst({ name: "", gst: "", hsn: "" });
    setShowGstModal(false);
    loadAll();
  }

  /* SAVE */
  async function save() {
    if (!validateForm()) return;

    const fd = new FormData();

    Object.keys(form).forEach(k => {
      if (k !== "images") fd.append(k, form[k]);
    });

    form.images.forEach(img => {
      if (img instanceof File) fd.append("images", img);
    });

    fd.append("variants", JSON.stringify(variants));

    await fetch("/api/admin/products", {
      method: editing ? "PUT" : "POST",
      body: fd,
    });

    alert("Saved");

    setEditing(null);
    refresh();
  }

  return (
    <div style={box}>
      <h2>{editing ? "Edit Product" : "Add Product"}</h2>

      <div style={grid}>
        <input name="name" required placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="brand" required placeholder="Brand" value={form.brand} onChange={handleChange} />
        <input value={form.sku} readOnly />
      </div>

      <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

      <div style={grid}>
        <div>
          <select name="category" required value={form.category} onChange={handleChange}>
            <option value="">Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button onClick={() => setShowCatModal(true)}>+</button>
        </div>

        <div>
          <select name="subcategory" required value={form.subcategory} onChange={handleChange}>
            <option value="">Subcategory</option>
            {subcategories.filter(s => s.category === form.category).map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <button onClick={() => setShowSubModal(true)}>+</button>
        </div>

        <div>
          <select required value={form.gstCategory} onChange={handleGst}>
            <option value="">GST</option>
            {gstCategories.map(g => (
              <option key={g._id} value={g._id}>{g.name} ({g.gst}%)</option>
            ))}
          </select>
          <button onClick={() => setShowGstModal(true)}>+</button>
        </div>
      </div>

      {/* MODALS */}
      {showCatModal && <div style={modal}><input value={newCategory} onChange={e => setNewCategory(e.target.value)} /><button onClick={createCategory}>Save</button></div>}
      {showSubModal && <div style={modal}><input value={newSubcategory} onChange={e => setNewSubcategory(e.target.value)} /><button onClick={createSubcategory}>Save</button></div>}
      {showGstModal && <div style={modal}>
        <input placeholder="Name" value={newGst.name} onChange={e => setNewGst({ ...newGst, name: e.target.value })} />
        <input placeholder="GST" value={newGst.gst} onChange={e => setNewGst({ ...newGst, gst: e.target.value })} />
        <input placeholder="HSN" value={newGst.hsn} onChange={e => setNewGst({ ...newGst, hsn: e.target.value })} />
        <button onClick={createGst}>Save</button>
      </div>}

      <h3>Variants</h3>
      {variants.map((v, i) => (
        <div key={i} style={variantRow}>
          <input value={v.type} onChange={e => updateVariant(i, "type", e.target.value)} />
          <input value={v.value} onChange={e => updateVariant(i, "value", e.target.value)} />
          <input value={v.cost} onChange={e => updateVariant(i, "cost", e.target.value)} />
          <input value={v.price} onChange={e => updateVariant(i, "price", e.target.value)} />
          <input value={v.stock} onChange={e => updateVariant(i, "stock", e.target.value)} />
          <input value={v.sku} readOnly />
          <button onClick={() => removeVariant(i)}>X</button>
        </div>
      ))}
      <button onClick={addVariant}>+ Variant</button>

      <input type="file" multiple onChange={handleImages} />
      <div style={{ display: "flex", gap: 10 }}>
        {previewImages.map((src, i) => <img key={i} src={src} width={60} />)}
      </div>

      <button onClick={save} style={btn}>Save Product</button>
    </div>
  );
}

/* TABLE */
function ProductTable({ products, refresh, setEditing }) {
  async function del(id) {
    await fetch("/api/admin/products?id=" + id, { method: "DELETE" });
    refresh();
  }

  return (
    <table width="100%" border="1">
      <tbody>
        {products.map(p => (
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

/* STYLES */
const box = { background: "#fff", padding: 20, marginBottom: 20 };
const grid = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 };
const variantRow = { display: "flex", gap: 8, marginBottom: 8 };
const btn = { background: "black", color: "#fff", padding: 10, marginTop: 10 };
const modal = { background: "#eee", padding: 10, marginTop: 10 };
