"use client";

import { useEffect, useState } from "react";

/* ================= PRODUCT PAGE ================= */
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();

    if (Array.isArray(data.products)) setProducts(data.products);
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
      <h1>Products</h1>
      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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

  const [modal, setModal] = useState({ type: "", value: "" });

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
    sku: "",
    status: "active",
    images: [],
    tags: [],
    variants: [],
  });

  /* ============== LOAD DATA ============== */
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [c, s, g] = await Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/subcategories").then((r) => r.json()),
      fetch("/api/admin/gst").then((r) => r.json()),
    ]);

    setCategories(Array.isArray(c.data) ? c.data : []);
    setSubcategories(Array.isArray(s.data) ? s.data : []);
    setGstCategories(Array.isArray(g.data) ? g.data : []);
  }

  /* ============== EDIT MODE ============== */
  useEffect(() => {
    if (editing) {
      setForm(editing);
      setVariants(editing.variants || []);
      setPreviewImages(editing.images || []);
    }
  }, [editing]);

  /* ============== HANDLERS ============== */
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

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

  useEffect(() => {
    if (!form.name) return;
    const base = form.name.split(" ")[0];
    setForm((f) => ({ ...f, sku: "NA" + base.toUpperCase() }));
  }, [form.name]);

  const profit =
    form.sellingPrice && form.costPrice
      ? (Number(form.sellingPrice) - Number(form.costPrice)).toFixed(2)
      : 0;

  function handleImages(e) {
    const files = [...e.target.files];
    setForm({ ...form, images: files });
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  }

  /* ================= VARIANTS ================= */
  function addVariant() {
    setVariants([
      ...variants,
      { type: "", value: "", cost: "", price: "", sku: "", stock: "" },
    ]);
  }

  function updateVariant(i, field, value) {
    const updated = [...variants];
    updated[i][field] = value;

    if (field === "value") {
      updated[i].sku = form.sku + value.toUpperCase();
    }
    setVariants(updated);
  }

  function removeVariant(i) {
    setVariants(variants.filter((_, idx) => idx !== i));
  }

  /* ============== INLINE ADD CATEGORY / SUBCATEGORY / GST ============== */
  async function addInline(type) {
    if (!modal.value) return alert("Enter value");

    try {
      let url = "/api/admin/categories";
      let body = { name: modal.value };

      if (type === "subcategories") {
        url = "/api/admin/subcategories";
        body.category = form.category;
      }
      if (type === "gst") url = "/api/admin/gst";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`Failed to add ${type}`);

      const newItem = await res.json();

      if (type === "categories") setCategories([...categories, newItem]);
      if (type === "subcategories") setSubcategories([...subcategories, newItem]);
      if (type === "gst") setGstCategories([...gstCategories, newItem]);

      setModal({ type: "", value: "" });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  /* ============== SAVE PRODUCT ================= */
  async function save() {
    const fd = new FormData();

    Object.keys(form).forEach((k) => {
      if (k !== "images" && k !== "variants") fd.append(k, form[k]);
    });

    form.images.forEach((img) => {
      if (img instanceof File) fd.append("images", img);
    });

    fd.append("variants", JSON.stringify(variants));

    await fetch("/api/admin/products", {
      method: editing ? "PUT" : "POST",
      body: fd,
    });

    setEditing(null);
    setForm({ ...form, images: [], variants: [] });
    setPreviewImages([]);
    refresh();
  }

  /* ================= RENDER ================= */
  return (
    <div style={{ background: "#fff", padding: 20, borderRadius: 8, marginBottom: 20 }}>
      <h2>{editing ? "Edit Product" : "Add Product"}</h2>

      {/* BASIC */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
        <input value={form.sku} placeholder="SKU" readOnly />
      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        style={{ width: "100%", marginTop: 10, padding: 8 }}
      />

      {/* CATEGORY DROPDOWNS + INLINE ADD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 10 }}>
        <div>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", marginTop: 5 }}>
            <input
              placeholder="Add Category"
              value={modal.type === "categories" ? modal.value : ""}
              onChange={(e) => setModal({ type: "categories", value: e.target.value })}
            />
            <button onClick={() => addInline("categories")}>Add</button>
          </div>
        </div>

        <div>
          <select name="subcategory" value={form.subcategory} onChange={handleChange}>
            <option value="">Select Subcategory</option>
            {subcategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", marginTop: 5 }}>
            <input
              placeholder="Add Subcategory"
              value={modal.type === "subcategories" ? modal.value : ""}
              onChange={(e) => setModal({ type: "subcategories", value: e.target.value })}
            />
            <button onClick={() => addInline("subcategories")}>Add</button>
          </div>
        </div>

        <div>
          <select value={form.gstCategory} onChange={handleGst}>
            <option value="">GST Category</option>
            {gstCategories.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", marginTop: 5 }}>
            <input
              placeholder="Add GST"
              value={modal.type === "gst" ? modal.value : ""}
              onChange={(e) => setModal({ type: "gst", value: e.target.value })}
            />
            <button onClick={() => addInline("gst")}>Add</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 10 }}>
        <input name="hsnCode" value={form.hsnCode} placeholder="HSN Code" readOnly />
        <input name="gstPercent" value={form.gstPercent} placeholder="GST %" readOnly />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* PRICING */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 10 }}>
        <input name="costPrice" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />
        <input name="mrp" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="sellingPrice" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} />
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Profit:</b> ₹ {profit}
      </div>

      {/* VARIANTS */}
      <h3>Variants</h3>
      {variants.map((v, i) => {
        const vp = v.price && v.cost ? v.price - v.cost : 0;
        return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input placeholder="Type" value={v.type} onChange={(e) => updateVariant(i, "type", e.target.value)} />
            <input placeholder="Value" value={v.value} onChange={(e) => updateVariant(i, "value", e.target.value)} />
            <input placeholder="Cost" value={v.cost} onChange={(e) => updateVariant(i, "cost", e.target.value)} />
            <input placeholder="Price" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} />
            <input placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} />
            <input placeholder="SKU" value={v.sku} readOnly />
            <span>₹{vp}</span>
            <button onClick={() => removeVariant(i)}>X</button>
          </div>
        );
      })}
      <button onClick={addVariant}>+ Add Variant</button>

      {/* IMAGE UPLOAD */}
      <h3>Images</h3>
      <input type="file" multiple onChange={handleImages} />
      <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
        {previewImages.map((src, i) => (
          <img key={i} src={src} width={60} />
        ))}
      </div>

      <button onClick={save} style={{ background: "black", color: "#fff", padding: 10, marginTop: 15 }}>
        Save Product
      </button>
    </div>
  );
}

/* ================= PRODUCT TABLE ================= */
function ProductTable({ products, refresh, setEditing }) {
  async function del(id) {
    if (!confirm("Delete product?")) return;
    await fetch("/api/admin/products?id=" + id, { method: "DELETE" });
    refresh();
  }

  return (
    <table width="100%" border="1" cellPadding="10" style={{ marginTop: 20 }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>SKU</th>
          <th>Variants</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p._id}>
            <td>{p.name}</td>
            <td>{p.sku}</td>
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
