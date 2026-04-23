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

  /* 🔥 NEW STATES (ADDED ONLY) */
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: "",
  });

  const [status, setStatus] = useState("draft");

  /* ================= GST CONFIG ================= */

  const gstOptions = [
    {
      name: "Flours & Meals (Cereal Based)",
      hsn: "1101 / 1102 / 1106",
      tax: 5,
      desc: "Flour, meal and powder of cereals, pulses, millets",
    },
    {
      name: "Food Preparations (Not Elsewhere Specified)",
      hsn: "2106",
      tax: 5,
      desc: "Includes dosa mix, idli mix, batter mix",
    },
    {
      name: "Spices",
      hsn: "0904 - 0910",
      tax: 5,
      desc: "Spices and masalas",
    },
    {
      name: "Edible Oils",
      hsn: "1507 - 1515",
      tax: 5,
      desc: "Cold pressed and vegetable oils",
    },
    {
      name: "Prepared / Preserved Foods",
      hsn: "2001 - 2008",
      tax: 12,
      desc: "Pickles, chutneys, preserved foods",
    },
    {
      name: "Ready to Eat / Packaged Food",
      hsn: "1904 / 2106",
      tax: 12,
      desc: "Packaged ready food",
    },
    {
      name: "Namkeen / Snack Items",
      hsn: "2106",
      tax: 12,
      desc: "Snacks and mixtures",
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

    /* SEO AUTO */
    setSeo({
      title: `${form.name} | Buy Online`,
      description: `Buy ${form.name} at best price with premium quality.`,
      keywords: `${form.name}, buy online`,
    });

  }, [form.name]);

  /* ================= GST AUTO ================= */

  useEffect(() => {
    if (!form.gstCategory) return;

    const selected = gstOptions.find(
      (g) => g.name === form.gstCategory
    );

    if (selected) {
      setForm((prev) => ({
        ...prev,
        hsn: selected.hsn,
        tax: selected.tax,
        gstDescription: selected.desc,
      }));
    }
  }, [form.gstCategory]);

  /* ================= VARIANTS ================= */

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

  /* 🔥 BULK VARIANT GENERATOR */
  function generateVariants() {
    const sizes = ["250GM", "500GM", "1KG"];

    const newVariants = sizes.map((s, i) => ({
      value: s.replace(/[A-Z]/g, ""),
      unit: s.replace(/[0-9]/g, ""),
      sku: `NA-${productKey}-${String(i + 1).padStart(3, "0")}-${s}`,
      mrp: "",
      sellingPrice: "",
    }));

    setForm({ ...form, variants: newVariants });
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e) {
    e?.preventDefault();

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
          seo,
          status,
        }),
      });
    }

    alert("Product Added");
  }

  /* ================= UI ================= */

  return (
    <div className="container">

      <div className="header">
        <h1>Product Upload</h1>
        <button onClick={handleSubmit}>Save</button>
      </div>

      <form>

        {/* STATUS */}
        <div className="card">
          <h3>Status</h3>
          <select value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>

        {/* BASIC */}
        <div className="card">
          <h3>Basic Info</h3>

          <input
            placeholder="Product Name"
            value={form.name}
            onChange={(e)=>setForm({...form,name:e.target.value})}
          />

          <select onChange={(e)=>setForm({...form,category:e.target.value})}>
            <option>Select Category</option>
            {websiteCategories.map(c=> <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* GST */}
        <div className="card">
          <h3>GST</h3>

          <select onChange={(e)=>setForm({...form,gstCategory:e.target.value})}>
            <option>Select GST</option>
            {gstOptions.map(g=>(
              <option key={g.name}>{g.name} ({g.tax}%)</option>
            ))}
          </select>

          <input value={form.hsn} readOnly placeholder="HSN"/>
          <input value={form.tax} readOnly placeholder="Tax"/>
          <textarea value={form.gstDescription} readOnly/>
        </div>

        {/* BULK VARIANT */}
        <div className="card">
          <h3>Quick Variants</h3>
          <button type="button" onClick={generateVariants}>
            Auto Create 250g / 500g / 1kg
          </button>
        </div>

        {/* VARIANTS */}
        <div className="card">
          <h3>Variants</h3>

          {form.variants.map((v,i)=>{

            const discount =
              v.mrp && v.sellingPrice
                ? Math.round(((v.mrp - v.sellingPrice)/v.mrp)*100)
                : 0;

            return (
              <div key={i} className="variant">

                <input placeholder="Value" onChange={(e)=>updateVariant(i,"value",e.target.value)}/>
                <select onChange={(e)=>updateVariant(i,"unit",e.target.value)}>
                  <option>GM</option><option>KG</option><option>ML</option><option>L</option>
                </select>
                <input placeholder="MRP" onChange={(e)=>updateVariant(i,"mrp",e.target.value)}/>
                <input placeholder="Selling Price" onChange={(e)=>updateVariant(i,"sellingPrice",e.target.value)}/>

                <input value={v.sku} readOnly/>

                <button type="button" onClick={()=>removeVariant(i)}>X</button>

                <div className="meta">
                  {v.sku}
                  {discount>0 && <span>{discount}% OFF</span>}
                </div>

              </div>
            );
          })}

          <button type="button" onClick={addVariant}>+ Add Variant</button>
        </div>

        {/* SEO */}
        <div className="card">
          <h3>SEO</h3>

          <input value={seo.title} onChange={(e)=>setSeo({...seo,title:e.target.value})}/>
          <textarea value={seo.description} onChange={(e)=>setSeo({...seo,description:e.target.value})}/>
          <input value={seo.keywords} onChange={(e)=>setSeo({...seo,keywords:e.target.value})}/>
        </div>

      </form>

      <style jsx>{`
        .container{max-width:1000px;margin:auto;padding:20px;}
        .header{display:flex;justify-content:space-between;margin-bottom:20px;}
        .card{background:#fff;padding:20px;margin-bottom:20px;border-radius:10px;border:1px solid #eee;}
        input,select,textarea{width:100%;padding:10px;margin:8px 0;}
        .variant{border:1px solid #eee;padding:10px;margin:10px 0;}
        .meta{display:flex;gap:10px;}
      `}</style>

    </div>
  );
}
