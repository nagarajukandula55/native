"use client";

import { useState, useEffect } from "react";

export default function ProductUpload() {

  const emptyVariant = {
    value: "",
    unit: "GM",
    sku: "",
    mrp: "",
    sellingPrice: "",
  };

  const emptyForm = {
    name: "",
    category: "",
    gstCategory: "",
    gstDescription: "",
    hsn: "",
    tax: "",
    description: "",
    shortDescription: "",
    ingredients: "",
    shelfLife: "",
    images: [],
    variants: [emptyVariant],
  };

  const [form, setForm] = useState(emptyForm);
  const [productKey, setProductKey] = useState("");
  const [slug, setSlug] = useState("");

  /* ================= GST CONFIG (FIXED) ================= */

  const gstOptions = [
    {
      name: "Flours & Meals (Cereal Based)",
      hsn: "1101 / 1102 / 1106",
      tax: 5,
      desc: "Flour, meal and powder of cereals, pulses, millets under Chapter 11",
    },
    {
      name: "Food Preparations (Not Elsewhere Specified)",
      hsn: "2106",
      tax: 5,
      desc: "Food preparations not elsewhere specified or included (includes dosa mix, idli mix)",
    },
    {
      name: "Spices",
      hsn: "0904 - 0910",
      tax: 5,
      desc: "Spices including pepper, chillies, turmeric, mixed masalas under Chapter 9",
    },
    {
      name: "Edible Oils",
      hsn: "1507 - 1515",
      tax: 5,
      desc: "Vegetable oils including groundnut, sesame, coconut oil",
    },
    {
      name: "Prepared / Preserved Foods",
      hsn: "2001 - 2008",
      tax: 12,
      desc: "Prepared or preserved vegetables, fruits, pickles, chutneys",
    },
    {
      name: "Ready to Eat / Packaged Food",
      hsn: "1904 / 2106",
      tax: 12,
      desc: "Prepared ready-to-eat food products including packaged items",
    },
    {
      name: "Namkeen / Snack Items",
      hsn: "2106",
      tax: 12,
      desc: "Namkeen, mixtures, fried snack products",
    },
  ];

  const websiteCategories = [
    "Instant Mixes",
    "Spices & Masalas",
    "Cold Pressed Oils",
    "Flours & Millets",
    "Ready to Cook",
    "Ready to Eat",
    "Pickles & Chutneys",
    "Snacks & Namkeen",
    "Breakfast Essentials",
    "Combo Packs",
    "New Arrivals",
  ];

  /* ================= AUTO ================= */

  useEffect(() => {
    if (!form.name) return;

    let clean = form.name.replace(/native/gi, "").trim();

    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setProductKey(key);

    const slugGen = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setSlug(slugGen);
  }, [form.name]);

  /* ================= GST AUTO ================= */

  useEffect(() => {
    const selected = gstOptions.find(g => g.name === form.gstCategory);

    if (selected) {
      setForm(prev => ({
        ...prev,
        hsn: selected.hsn,
        tax: selected.tax,
        gstDescription: selected.desc,
      }));
    }
  }, [form.gstCategory]);

  /* ================= VARIANT ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];
    updated[i][field] = value;

    if (updated[i].value) {
      const seq = String(i + 1).padStart(3, "0");
      updated[i].sku = `NA-${productKey}-${seq}-${updated[i].value}${updated[i].unit}`;
    }

    setForm({ ...form, variants: updated });
  }

  function addVariant() {
    setForm({ ...form, variants: [...form.variants, emptyVariant] });
  }

  function removeVariant(i) {
    setForm({
      ...form,
      variants: form.variants.filter((_, idx) => idx !== i),
    });
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e) {
    e.preventDefault();

    for (let v of form.variants) {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          variant: `${v.value}${v.unit}`,
          sku: v.sku,
          mrp: v.mrp,
          sellingPrice: v.sellingPrice,
          productKey,
          slug,
        }),
      });
    }

    alert("Product Added");
  }

  /* ================= UI ================= */

  return (
    <div className="container">
      <h1>Product Upload</h1>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Select Category</option>
          {websiteCategories.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* GST */}
        <select onChange={(e) => setForm({ ...form, gstCategory: e.target.value })}>
          <option>Select GST Category</option>
          {gstOptions.map(g => (
            <option key={g.name}>{g.name} ({g.tax}%)</option>
          ))}
        </select>

        <input value={form.hsn} readOnly placeholder="HSN Code" />
        <input value={form.tax} readOnly placeholder="Tax %" />
        <textarea value={form.gstDescription} readOnly />

        {/* VARIANTS */}
        <h3>Variants</h3>

        {form.variants.map((v, i) => (
          <div key={i} className="row">
            <input placeholder="Value" onChange={(e)=>updateVariant(i,"value",e.target.value)} />
            <select onChange={(e)=>updateVariant(i,"unit",e.target.value)}>
              <option>GM</option><option>KG</option><option>ML</option><option>L</option>
            </select>
            <input placeholder="MRP" onChange={(e)=>updateVariant(i,"mrp",e.target.value)} />
            <input placeholder="Selling Price" onChange={(e)=>updateVariant(i,"sellingPrice",e.target.value)} />
            <input value={v.sku} readOnly />
            <button type="button" onClick={()=>removeVariant(i)}>X</button>
          </div>
        ))}

        <button type="button" onClick={addVariant}>+ Add Variant</button>

        <button>Add Product</button>

      </form>

      <style jsx>{`
        .container { max-width:900px;margin:auto;padding:20px; }
        input,select,textarea { width:100%;padding:10px;margin:8px 0; }
        .row { display:grid;grid-template-columns:1fr 1fr 1fr 1fr 2fr auto;gap:10px; }
      `}</style>
    </div>
  );
}
