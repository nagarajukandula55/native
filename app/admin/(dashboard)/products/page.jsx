"use client";

import { useEffect, useState } from "react";

/* ==================== PRODUCTS PAGE ==================== */
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : data.data || []);
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
        style={styles.search}
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

/* ==================== PRODUCT FORM ==================== */
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
    sku: "",
    status: "active",
    images: [],
  });

  const [modal, setModal] = useState({
    show: false,
    type: "",
    value: "",
    hsn: "",
    gst: "",
  });

  /* LOAD DROPDOWNS */
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

  /* EDIT MODE */
  useEffect(() => {
    if (editing) {
      setForm(editing);
      setVariants(editing.variants || []);
      if (editing.images) setPreviewImages(editing.images);
    }
  }, [editing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* GST AUTO */
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

  /* SKU AUTO */
  useEffect(() => {
    if (!form.name) return;
    const base = form.name.split(" ")[0];
    setForm((f) => ({ ...f, sku: "NA" + base.toUpperCase() }));
  }, [form.name]);

  /* PROFIT */
  const profit =
    form.sellingPrice && form.costPrice
      ? (Number(form.sellingPrice) - Number(form.costPrice)).toFixed(2)
      : 0;

  /* IMAGE PREVIEW */
  function handleImages(e) {
    const files = [...e.target.files];
    setForm({ ...form, images: files });

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  }

  /* VARIANTS */
  function addVariant() {
    setVariants([
      ...variants,
      { type: "", value: "", cost: "", price: "", stock: "", sku: "" },
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
    setVariants(variants.filter((_, index) => index !== i));
  }

  /* INLINE ADD CATEGORY/SUBCATEGORY/GST */
  async function addNew(type) {
    if (!modal.value) return;

    let endpoint = "";
    let body = { name: modal.value };

    if (type === "categories") endpoint = "/api/admin/categories";
    else if (type === "subcategories") endpoint = "/api/admin/subcategories";
    else if (type === "gst") {
      endpoint = "/api/admin/gst";
      body.hsn = modal.hsn;
      body.gst = modal.gst;
    } else return;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to add " + type);

      setModal({ show: false, type: "", value: "", hsn: "", gst: "" });
      loadAll(); // refresh dropdowns
    } catch (err) {
      console.error(err);
      alert("Error adding " + type);
    }
  }

  /* SAVE PRODUCT */
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
    setForm({
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
    });
    setPreviewImages([]);
    setVariants([]);
    refresh();
  }

  return (
    <div style={styles.box}>
      <h2>{editing ? "Edit Product" : "Add Product"}</h2>

      {/* BASIC */}
      <div style={styles.grid}>
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
        <input value={form.sku} readOnly placeholder="SKU" />
      </div>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      {/* CATEGORY + INLINE ADD */}
      <div style={styles.grid}>
        <div style={styles.inline}>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setModal({ show: true, type: "categories" })}
          >
            + Add
          </button>
        </div>

        <div style={styles.inline}>
          <select
            name="subcategory"
            value={form.subcategory}
            onChange={handleChange}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setModal({ show: true, type: "subcategories" })}
          >
            + Add
          </button>
        </div>

        <div style={styles.inline}>
          <select
            value={form.gstCategory}
            onChange={handleGst}
          >
            <option value="">GST Category</option>
            {gstCategories.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setModal({ show: true, type: "gst" })}
          >
            + Add
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <input name="hsnCode" placeholder="HSN" value={form.hsnCode} readOnly />
        <input name="gstPercent" placeholder="GST %" value={form.gstPercent} readOnly />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* PRICING */}
      <div style={styles.grid}>
        <input
          name="costPrice"
          placeholder="Cost Price"
          value={form.costPrice}
          onChange={handleChange}
        />
        <input
          name="mrp"
          placeholder="MRP"
          value={form.mrp}
          onChange={handleChange}
        />
        <input
          name="sellingPrice"
          placeholder="Selling Price"
          value={form.sellingPrice}
          onChange={handleChange}
        />
      </div>

      <div><b>Profit: ₹{profit}</b></div>

      {/* VARIANTS */}
      <h3>Variants</h3>
      {variants.map((v, i) => (
        <div key={i} style={styles.variantRow}>
          <input placeholder="Type" value={v.type} onChange={e => updateVariant(i,"type",e.target.value)} />
          <input placeholder="Value" value={v.value} onChange={e => updateVariant(i,"value",e.target.value)} />
          <input placeholder="Cost" value={v.cost} onChange={e => updateVariant(i,"cost",e.target.value)} />
          <input placeholder="Price" value={v.price} onChange={e => updateVariant(i,"price",e.target.value)} />
          <input placeholder="Stock" value={v.stock} onChange={e => updateVariant(i,"stock",e.target.value)} />
          <input value={v.sku} readOnly />
          <span>₹{v.price && v.cost ? v.price - v.cost : 0}</span>
          <button onClick={() => removeVariant(i)}>X</button>
        </div>
      ))}
      <button onClick={addVariant}>+ Add Variant</button>

      {/* IMAGES */}
      <h3>Images</h3>
      <input type="file" multiple onChange={handleImages} />
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        {previewImages.map((src, i) => (
          <img key={i} src={src} width={60} />
        ))}
      </div>

      <button onClick={save} style={styles.btn}>Save Product</button>

      {/* MODAL FOR INLINE ADD */}
      {modal.show && (
        <div style={styles.modal}>
          <h3>Add {modal.type}</h3>
          <input
            placeholder="Name"
            value={modal.value}
            onChange={(e) => setModal({ ...modal, value: e.target.value })}
          />
          {modal.type === "gst" && (
            <>
              <input
                placeholder="HSN Code"
                value={modal.hsn}
                onChange={(e) => setModal({ ...modal, hsn: e.target.value })}
              />
              <input
                placeholder="GST %"
                type="number"
                value={modal.gst}
                onChange={(e) => setModal({ ...modal, gst: e.target.value })}
              />
            </>
          )}
          <button onClick={() => addNew(modal.type)}>Save</button>
          <button onClick={() => setModal({ show: false, type: "" })}>Cancel</button>
        </div>
      )}
    </div>
  );
}

/* ==================== PRODUCT TABLE ==================== */
function ProductTable({ products, refresh, setEditing }) {
  async function del(id) {
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

/* ==================== STYLES ==================== */
const styles = {
  box: { background: "#fff", padding: 20, marginBottom: 20, borderRadius: 8 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 10 },
  variantRow: { display: "flex", gap: 8, marginBottom: 8 },
  btn: { background: "#000", color: "#fff", padding: 10, marginTop: 10 },
  search: { width: "100%", padding: 10, marginBottom: 20 },
  inline: { display: "flex", alignItems: "center", gap: 5 },
  modal: {
    position: "fixed",
    top: "30%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    zIndex: 999,
  },
};
