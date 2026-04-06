"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal"; // Assuming you have a generic modal component
import slugify from "slugify";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : data.data || []);
  }

  useEffect(() => fetchProducts(), []);

  const filtered = products.filter(p =>
    p?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Products Management</h1>
      <input
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={styles.searchInput}
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

/* ================== FORM ================== */

function ProductForm({ refresh, editing, setEditing }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [gstCategories, setGstCategories] = useState([]);

  const [previewImages, setPreviewImages] = useState([]);
  const [variants, setVariants] = useState([]);

  const [modal, setModal] = useState({ show: false, type: "", value: "" });

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

  useEffect(() => loadAll(), []);
  async function loadAll() {
    const [c, s, g] = await Promise.all([
      fetch("/api/admin/categories").then(r => r.json()),
      fetch("/api/admin/subcategories").then(r => r.json()),
      fetch("/api/admin/gst").then(r => r.json()),
    ]);
    setCategories(c || []);
    setSubcategories(s || []);
    setGstCategories(g || []);
  }

  useEffect(() => {
    if (editing) {
      setForm(editing);
      setVariants(editing.variants || []);
      setPreviewImages(editing.images || []);
    }
  }, [editing]);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  /* SKU auto */
  useEffect(() => {
    if (!form.name) return;
    const base = form.name.split(" ")[0];
    setForm(f => ({ ...f, sku: "NA" + base.toUpperCase() }));
  }, [form.name]);

  /* PROFIT calculation */
  const profit =
    Number(form.sellingPrice || 0) - Number(form.costPrice || 0);

  /* IMAGE preview */
  function handleImages(e) {
    const files = [...e.target.files];
    setForm({ ...form, images: files });

    const previews = files.map(f =>
      f instanceof File ? URL.createObjectURL(f) : f
    );
    setPreviewImages(previews);
  }

  /* VARIANTS */
  function addVariant() {
    setVariants([
      ...variants,
      { type: "", value: "", cost: "", price: "", sku: "" },
    ]);
  }

  function updateVariant(i, field, value) {
    const updated = [...variants];
    updated[i][field] = value;
    if (field === "value") updated[i].sku = form.sku + value.toUpperCase();
    setVariants(updated);
  }

  function removeVariant(i) {
    setVariants(variants.filter((_, idx) => idx !== i));
  }

  /* ADD INLINE CATEGORY/SUBCATEGORY/GST */
  async function addNew(type, name) {
    if (!name) return;
    await fetch(`/api/admin/${type}`, {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: { "Content-Type": "application/json" },
    });
    setModal({ show: false, type: "", value: "" });
    loadAll();
  }

  async function save() {
    const fd = new FormData();
    Object.keys(form).forEach(k => {
      if (k !== "images") fd.append(k, form[k]);
    });
    if (form.images) {
      form.images.forEach(img => {
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
    setVariants([]);
    setPreviewImages([]);
  }

  return (
    <div style={styles.card}>
      <h2>{editing ? "Edit Product" : "Add Product"}</h2>

      <div style={styles.grid}>
        <input
          name="name"
          placeholder="Product Name"
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
        onChange={e => setForm({ ...form, description: e.target.value })}
      />

      <div style={styles.grid}>
        <div>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setModal({ show: true, type: "categories", value: "" })}
          >
            + Add
          </button>
        </div>

        <div>
          <select
            name="subcategory"
            value={form.subcategory}
            onChange={handleChange}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map(s => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setModal({ show: true, type: "subcategories", value: "" })
            }
          >
            + Add
          </button>
        </div>

        <div>
          <select value={form.gstCategory} onChange={handleGst}>
            <option value="">GST Category</option>
            {gstCategories.map(g => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setModal({ show: true, type: "gst", value: "" })
            }
          >
            + Add
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <input placeholder="HSN" value={form.hsnCode} readOnly />
        <input placeholder="GST %" value={form.gstPercent} readOnly />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

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

      <div style={{ marginBottom: 10 }}>Profit: ₹ {profit}</div>

      {/* VARIANTS */}
      <h3>Variants</h3>
      {variants.map((v, i) => (
        <div key={i} style={styles.variantRow}>
          <input
            placeholder="Type"
            value={v.type}
            onChange={e => updateVariant(i, "type", e.target.value)}
          />
          <input
            placeholder="Value"
            value={v.value}
            onChange={e => updateVariant(i, "value", e.target.value)}
          />
          <input
            placeholder="Cost"
            value={v.cost}
            onChange={e => updateVariant(i, "cost", e.target.value)}
          />
          <input
            placeholder="Price"
            value={v.price}
            onChange={e => updateVariant(i, "price", e.target.value)}
          />
          <input value={v.sku} readOnly placeholder="SKU" />
          <span>
            ₹{Number(v.price || 0) - Number(v.cost || 0)}
          </span>
          <button onClick={() => removeVariant(i)}>X</button>
        </div>
      ))}
      <button onClick={addVariant}>+ Add Variant</button>

      {/* IMAGES */}
      <h3>Images</h3>
      <input type="file" multiple onChange={handleImages} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: 10 }}>
        {previewImages.map((src, i) => (
          <img key={i} src={src} width={60} />
        ))}
      </div>

      <button onClick={save} style={styles.btn}>
        Save Product
      </button>

      {/* Modal for adding category/subcategory/GST */}
      {modal.show && (
        <Modal
          title={`Add ${modal.type}`}
          onClose={() => setModal({ show: false, type: "", value: "" })}
        >
          <input
            placeholder={`Enter ${modal.type} name`}
            value={modal.value}
            onChange={e => setModal({ ...modal, value: e.target.value })}
          />
          <button onClick={() => addNew(modal.type, modal.value)}>Save</button>
        </Modal>
      )}
    </div>
  );
}

/* ================== TABLE ================== */

function ProductTable({ products, refresh, setEditing }) {
  async function del(id) {
    await fetch("/api/admin/products?id=" + id, { method: "DELETE" });
    refresh();
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>SKU</th>
          <th>Variants</th>
          <th>Cost</th>
          <th>Price</th>
          <th>Profit</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {products.map(p => (
          <tr key={p._id}>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>{p.variants?.length || 0}</td>
            <td>{p.costPrice}</td>
            <td>{p.sellingPrice}</td>
            <td>
              {p.sellingPrice && p.costPrice
                ? Number(p.sellingPrice) - Number(p.costPrice)
                : 0}
            </td>
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

/* ================== STYLES ================== */
const styles = {
  card: {
    background: "#fff",
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 10,
    marginBottom: 10,
  },
  variantRow: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" },
  btn: { background: "#000", color: "#fff", padding: 10, marginTop: 10 },
  searchInput: { width: "100%", padding: 10, marginBottom: 20 },
};
