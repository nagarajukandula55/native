"use client";

import { useEffect, useState } from "react";

/* ================= MAIN PAGE ================= */

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  async function fetchProducts() {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();

      // ✅ SAFE NORMALIZATION
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        console.error("Invalid products response:", data);
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
    }
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
      <TopBar search={search} setSearch={setSearch} />

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

/* ================= TOP BAR ================= */

function TopBar({ search, setSearch }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <input
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          border: "1px solid #ddd",
        }}
      />
    </div>
  );
}

/* ================= PRODUCT FORM ================= */

function ProductForm({ refresh, editing, setEditing }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);

  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [newGst, setNewGst] = useState({ name: "", hsn: "", gst: "" });

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
    try {
      const [c, s, g] = await Promise.all([
        fetch("/api/admin/categories").then(r => r.json()),
        fetch("/api/admin/subcategories").then(r => r.json()),
        fetch("/api/admin/gst").then(r => r.json()),
      ]);

      // ✅ SAFE SET
      setCategories(Array.isArray(c) ? c : c.data || []);
      setSubcategories(Array.isArray(s) ? s : s.data || []);
      setGstCategories(Array.isArray(g) ? g : g.data || []);
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  useEffect(() => {
    if (editing) setForm(editing);
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

    const base = form.name.replace("Native", "").trim().split(" ")[0];
    setForm(f => ({ ...f, sku: "NA" + base.toUpperCase() }));
  }, [form.name]);

  /* INLINE ADD */

  async function addCategory() {
    if (!newCategory) return;

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: newCategory }),
    });

    const data = await res.json();
    setCategories(prev => [...prev, data]);
    setForm({ ...form, category: data._id });
    setNewCategory("");
  }

  async function addSubcategory() {
    if (!newSubcategory || !form.category) return;

    const res = await fetch("/api/admin/subcategories", {
      method: "POST",
      body: JSON.stringify({
        name: newSubcategory,
        categoryId: form.category,
      }),
    });

    const data = await res.json();
    setSubcategories(prev => [...prev, data]);
    setForm({ ...form, subcategory: data._id });
    setNewSubcategory("");
  }

  async function addGst() {
    if (!newGst.name || !newGst.hsn || !newGst.gst) return;

    const res = await fetch("/api/admin/gst", {
      method: "POST",
      body: JSON.stringify(newGst),
    });

    const data = await res.json();

    setGstCategories(prev => [...prev, data]);

    setForm({
      ...form,
      gstCategory: data._id,
      hsnCode: data.hsn,
      gstPercent: data.gst,
    });

    setNewGst({ name: "", hsn: "", gst: "" });
  }

  async function save() {
    const fd = new FormData();

    Object.keys(form).forEach(k => {
      if (k !== "images") fd.append(k, form[k]);
    });

    form.images.forEach(img => fd.append("images", img));

    await fetch("/api/admin/products", {
      method: editing ? "PUT" : "POST",
      body: fd,
    });

    setEditing(null);
    refresh();
  }

  return (
    <div style={card}>
      <h2>{editing ? "Edit Product" : "Add Product"}</h2>

      {/* BASIC */}
      <Section title="Basic Info">
        <Grid>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
          <input value={form.sku} readOnly placeholder="SKU" />
        </Grid>

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </Section>

      {/* CATEGORY */}
      <Section title="Category & GST">
        <Grid>
          {/* CATEGORY */}
          <div>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Category</option>
              {(Array.isArray(categories) ? categories : []).map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <InlineAdd value={newCategory} setValue={setNewCategory} onAdd={addCategory} placeholder="New Category" />
          </div>

          {/* SUBCATEGORY */}
          <div>
            <select name="subcategory" value={form.subcategory} onChange={handleChange}>
              <option value="">Subcategory</option>
              {(Array.isArray(subcategories) ? subcategories : [])
                .filter(s => s.category?._id === form.category)
                .map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
            </select>

            <InlineAdd value={newSubcategory} setValue={setNewSubcategory} onAdd={addSubcategory} placeholder="New Subcategory" />
          </div>

          {/* GST */}
          <div>
            <select value={form.gstCategory} onChange={handleGst}>
              <option value="">GST</option>
              {(Array.isArray(gstCategories) ? gstCategories : []).map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 5 }}>
              <input placeholder="Name" onChange={e => setNewGst({ ...newGst, name: e.target.value })} />
              <input placeholder="HSN" onChange={e => setNewGst({ ...newGst, hsn: e.target.value })} />
              <input placeholder="%" onChange={e => setNewGst({ ...newGst, gst: e.target.value })} />
              <button onClick={addGst}>+</button>
            </div>
          </div>
        </Grid>
      </Section>

      {/* PRICING */}
      <Section title="Pricing & Stock">
        <Grid>
          <input name="costPrice" placeholder="Cost" value={form.costPrice} onChange={handleChange} />
          <input name="mrp" placeholder="MRP" value={form.mrp} onChange={handleChange} />
          <input name="sellingPrice" placeholder="Selling" value={form.sellingPrice} onChange={handleChange} />
          <input name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />
        </Grid>
      </Section>

      {/* MEDIA */}
      <Section title="Images">
        <input type="file" multiple onChange={e => setForm({ ...form, images: [...e.target.files] })} />
      </Section>

      <button style={btn} onClick={save}>
        {editing ? "Update" : "Save"}
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
          <th>Price</th>
          <th>Stock</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {(Array.isArray(products) ? products : []).map(p => (
          <tr key={p._id}>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>{p.sellingPrice}</td>
            <td>{p.stock}</td>
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

/* ================= UI HELPERS ================= */

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 10,
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function InlineAdd({ value, setValue, onAdd, placeholder }) {
  return (
    <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
      <input value={value} placeholder={placeholder} onChange={e => setValue(e.target.value)} />
      <button onClick={onAdd}>+</button>
    </div>
  );
}

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
};

const btn = {
  background: "#000",
  color: "#fff",
  padding: 10,
  border: "none",
};
