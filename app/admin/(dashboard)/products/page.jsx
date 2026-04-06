"use client";

import { useState, useEffect } from "react";

export default function ProductPage() {
  const [tab, setTab] = useState("basic");

  return (
    <div style={{ padding: 20 }}>
      <h1>Product Management</h1>

      {/* TABS */}
      <div style={tabs}>
        {["basic", "pricing", "inventory", "variants", "seo"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabBtn(tab === t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <ProductForm tab={tab} />
    </div>
  );
}

/* ================= FORM ================= */

function ProductForm({ tab }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    gstPercent: "",
    taxIncluded: false,
  });

  const [variants, setVariants] = useState([]);

  /* SKU AUTO */
  useEffect(() => {
    if (form.name && form.category) {
      const sku = `${form.name.slice(0,3)}-${Date.now()}`;
      setForm(f => ({ ...f, sku }));
    }
  }, [form.name, form.category]);

  /* SEO AUTO */
  useEffect(() => {
    if (form.name) {
      fetch("/api/seo/generate", {
        method: "POST",
        body: JSON.stringify(form),
      })
        .then(r => r.json())
        .then(data => {
          setForm(f => ({
            ...f,
            seoTitle: data.title,
            seoDescription: data.description,
          }));
        });
    }
  }, [form.name]);

  function handle(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  /* GST SPLIT */
  const cgst = form.gstPercent / 2;
  const sgst = form.gstPercent / 2;

  return (
    <div style={box}>
      {/* BASIC */}
      {tab === "basic" && (
        <>
          <input name="name" placeholder="Product Name" onChange={handle} />
          <input name="brand" placeholder="Brand" onChange={handle} />
          <textarea name="description" placeholder="Description" onChange={handle} />
        </>
      )}

      {/* PRICING */}
      {tab === "pricing" && (
        <>
          <input name="costPrice" placeholder="Cost" onChange={handle} />
          <input name="mrp" placeholder="MRP" onChange={handle} />
          <input name="sellingPrice" placeholder="Selling" onChange={handle} />

          <input name="gstPercent" placeholder="GST %" onChange={handle} />

          <label>
            <input type="checkbox" name="taxIncluded" onChange={handle} />
            Tax Included
          </label>

          <p>CGST: {cgst}% | SGST: {sgst}%</p>
        </>
      )}

      {/* INVENTORY */}
      {tab === "inventory" && (
        <>
          <input name="totalStock" placeholder="Stock" onChange={handle} />
          <input name="lowStockAlert" placeholder="Low Alert" onChange={handle} />

          <label>
            <input type="checkbox" name="trackInventory" onChange={handle} />
            Track Inventory
          </label>
        </>
      )}

      {/* VARIANTS */}
      {tab === "variants" && (
        <>
          {variants.map((v, i) => (
            <div key={i}>
              <input placeholder="Type" />
              <input placeholder="Value" />
              <input placeholder="Price" />
            </div>
          ))}
          <button onClick={() => setVariants([...variants, {}])}>
            + Add Variant
          </button>
        </>
      )}

      {/* SEO */}
      {tab === "seo" && (
        <>
          <input value={form.seoTitle || ""} readOnly />
          <textarea value={form.seoDescription || ""} readOnly />
        </>
      )}

      <button style={btn}>Save Product</button>
    </div>
  );
}

/* ================= STYLES ================= */

const tabs = { display: "flex", gap: 10, marginBottom: 20 };
const tabBtn = active => ({
  padding: 10,
  background: active ? "black" : "#ddd",
  color: active ? "#fff" : "#000",
});
const box = { background: "#fff", padding: 20 };
const btn = { marginTop: 20, padding: 10, background: "black", color: "#fff" };
