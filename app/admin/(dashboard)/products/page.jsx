"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  async function fetchProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <ProductForm refresh={fetchProducts} editing={editing} setEditing={setEditing} />
    </div>
  );
}

/* ================= FORM ================= */

function ProductForm({ refresh, editing, setEditing }) {
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

    totalStock: "",
    lowStockAlert: "",
    trackInventory: true,
    allowBackorder: false,

    weight: "",
    dimensions: { length: "", width: "", height: "" },

    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",

    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,

    images: [],
    status: "active",
  });

  const [variants, setVariants] = useState([]);
  const [preview, setPreview] = useState([]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function handleDimension(field, value) {
    setForm({
      ...form,
      dimensions: { ...form.dimensions, [field]: value },
    });
  }

  /* PROFIT AUTO */
  const profit =
    form.costPrice && form.sellingPrice
      ? Number(form.sellingPrice) - Number(form.costPrice)
      : 0;

  /* IMAGE */
  function handleImages(e) {
    const files = [...e.target.files];
    setForm({ ...form, images: files });
    setPreview(files.map(f => URL.createObjectURL(f)));
  }

  /* VARIANTS */
  function addVariant() {
    setVariants([
      ...variants,
      {
        type: "",
        value: "",
        costPrice: "",
        mrp: "",
        sellingPrice: "",
        stock: "",
        sku: "",
      },
    ]);
  }

  function updateVariant(i, field, value) {
    const v = [...variants];
    v[i][field] = value;

    if (field === "value") {
      v[i].sku = form.name + "-" + value;
    }

    setVariants(v);
  }

  function removeVariant(i) {
    setVariants(variants.filter((_, idx) => idx !== i));
  }

  /* VALIDATION */
  function validate() {
    if (!form.name || !form.category || !form.costPrice || !form.sellingPrice) {
      alert("Fill required fields");
      return false;
    }

    if (Number(form.sellingPrice) < Number(form.costPrice)) {
      alert("Loss not allowed");
      return false;
    }

    return true;
  }

  /* SAVE */
  async function save() {
    if (!validate()) return;

    const fd = new FormData();

    Object.keys(form).forEach(k => {
      if (k !== "images" && k !== "dimensions")
        fd.append(k, form[k]);
    });

    fd.append("dimensions", JSON.stringify(form.dimensions));
    fd.append("variants", JSON.stringify(variants));

    form.images.forEach(img => fd.append("images", img));

    await fetch("/api/admin/products", {
      method: "POST",
      body: fd,
    });

    alert("Saved");
    refresh();
  }

  return (
    <div style={box}>
      <h2>Product</h2>

      {/* BASIC */}
      <h3>Basic Info</h3>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="brand" placeholder="Brand" onChange={handleChange} />
      <textarea name="description" placeholder="Description" onChange={handleChange} />

      {/* PRICING */}
      <h3>Pricing</h3>
      <input name="costPrice" placeholder="Cost" onChange={handleChange} />
      <input name="mrp" placeholder="MRP" onChange={handleChange} />
      <input name="sellingPrice" placeholder="Selling" onChange={handleChange} />
      <p>Profit: ₹{profit}</p>

      {/* INVENTORY */}
      <h3>Inventory</h3>
      <input name="totalStock" placeholder="Total Stock" onChange={handleChange} />
      <input name="lowStockAlert" placeholder="Low Stock Alert" onChange={handleChange} />
      <label>
        <input type="checkbox" name="trackInventory" onChange={handleChange} /> Track Inventory
      </label>
      <label>
        <input type="checkbox" name="allowBackorder" onChange={handleChange} /> Allow Backorder
      </label>

      {/* VARIANTS */}
      <h3>Variants</h3>
      {variants.map((v, i) => (
        <div key={i} style={row}>
          <input placeholder="Type" onChange={e => updateVariant(i, "type", e.target.value)} />
          <input placeholder="Value" onChange={e => updateVariant(i, "value", e.target.value)} />
          <input placeholder="Cost" onChange={e => updateVariant(i, "costPrice", e.target.value)} />
          <input placeholder="MRP" onChange={e => updateVariant(i, "mrp", e.target.value)} />
          <input placeholder="Selling" onChange={e => updateVariant(i, "sellingPrice", e.target.value)} />
          <input placeholder="Stock" onChange={e => updateVariant(i, "stock", e.target.value)} />
          <input value={v.sku} readOnly />
          <button onClick={() => removeVariant(i)}>X</button>
        </div>
      ))}
      <button onClick={addVariant}>+ Variant</button>

      {/* SHIPPING */}
      <h3>Shipping</h3>
      <input name="weight" placeholder="Weight (kg)" onChange={handleChange} />
      <input placeholder="Length" onChange={e => handleDimension("length", e.target.value)} />
      <input placeholder="Width" onChange={e => handleDimension("width", e.target.value)} />
      <input placeholder="Height" onChange={e => handleDimension("height", e.target.value)} />

      {/* SEO */}
      <h3>SEO</h3>
      <input name="seoTitle" placeholder="SEO Title" onChange={handleChange} />
      <textarea name="seoDescription" placeholder="SEO Description" onChange={handleChange} />
      <input name="seoKeywords" placeholder="Keywords (comma separated)" onChange={handleChange} />

      {/* FLAGS */}
      <h3>Product Flags</h3>
      <label><input type="checkbox" name="isFeatured" onChange={handleChange} /> Featured</label>
      <label><input type="checkbox" name="isBestSeller" onChange={handleChange} /> Best Seller</label>
      <label><input type="checkbox" name="isNewArrival" onChange={handleChange} /> New Arrival</label>

      {/* IMAGES */}
      <h3>Images</h3>
      <input type="file" multiple onChange={handleImages} />
      <div style={{ display: "flex", gap: 10 }}>
        {preview.map((p, i) => (
          <img key={i} src={p} width={60} />
        ))}
      </div>

      <button onClick={save} style={btn}>Save Product</button>
    </div>
  );
}

/* STYLES */
const box = { background: "#fff", padding: 20 };
const row = { display: "flex", gap: 6, marginBottom: 8 };
const btn = { background: "black", color: "#fff", padding: 10 };
