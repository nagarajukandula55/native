"use client";

import { useState, useEffect } from "react";

export default function ProductUpload() {

  const createVariant = () => ({
    value: "",
    unit: "GM",
    sku: "",
    mrp: "",
    sellingPrice: "",
  });

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
    variants: [createVariant()],
  };

  const [form, setForm] = useState(emptyForm);
  const [productKey, setProductKey] = useState("");
  const [slug, setSlug] = useState("");
  const [tab, setTab] = useState("general");

  /* ================= GST ================= */

  const gstOptions = [
    {
      name: "Food Preparations (Not Elsewhere Specified)",
      hsn: "2106",
      tax: 5,
      desc: "Food preparations not elsewhere specified (includes dosa mix, idli mix)",
    },
    {
      name: "Flours & Meals",
      hsn: "1101 / 1106",
      tax: 5,
      desc: "Flour, meal and powder of cereals",
    },
    {
      name: "Spices",
      hsn: "0904 - 0910",
      tax: 5,
      desc: "Spices including masalas",
    },
    {
      name: "Edible Oils",
      hsn: "1507 - 1515",
      tax: 5,
      desc: "Vegetable oils",
    },
    {
      name: "Prepared Foods",
      hsn: "2001 - 2008",
      tax: 12,
      desc: "Pickles, chutneys",
    },
  ];

  const categories = [
    "Instant Mixes",
    "Spices",
    "Oils",
    "Flours",
    "Snacks",
  ];

  /* ================= AUTO ================= */

  useEffect(() => {
    if (!form.name) return;

    const clean = form.name.replace(/native/gi, "").trim();
    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setProductKey(key);

    const slugGen = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setSlug(slugGen);
  }, [form.name]);

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

  /* ================= VARIANTS ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];
    updated[i][field] = value;

    if (updated[i].value && productKey) {
      const seq = String(i + 1).padStart(3, "0");
      updated[i].sku = `NA-${productKey}-${seq}-${updated[i].value}${updated[i].unit}`;
    }

    setForm({ ...form, variants: updated });
  }

  function addVariant() {
    setForm({ ...form, variants: [...form.variants, createVariant()] });
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

      <h1>Product Admin</h1>

      <div className="tabs">
        {["general", "variants"].map(t => (
          <button key={t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>

        {tab === "general" && (
          <>
            <input placeholder="Product Name"
              onChange={(e)=>setForm({...form,name:e.target.value})}
            />

            <select onChange={(e)=>setForm({...form,category:e.target.value})}>
              <option>Select Category</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>

            <select onChange={(e)=>setForm({...form,gstCategory:e.target.value})}>
              <option>Select GST</option>
              {gstOptions.map(g => (
                <option key={g.name}>{g.name}</option>
              ))}
            </select>

            <input value={form.hsn} readOnly placeholder="HSN" />
            <input value={form.tax} readOnly placeholder="Tax" />

            <textarea value={form.gstDescription} readOnly />

            <textarea placeholder="Short Desc"
              onChange={(e)=>setForm({...form,shortDescription:e.target.value})}
            />

            <textarea placeholder="Description"
              onChange={(e)=>setForm({...form,description:e.target.value})}
            />
          </>
        )}

        {tab === "variants" && (
          <>
            {form.variants.map((v,i)=>(
              <div key={i} className="row">

                <input placeholder="Value"
                  onChange={(e)=>updateVariant(i,"value",e.target.value)}
                />

                <select onChange={(e)=>updateVariant(i,"unit",e.target.value)}>
                  <option>GM</option><option>KG</option>
                </select>

                <input placeholder="MRP"
                  onChange={(e)=>updateVariant(i,"mrp",e.target.value)}
                />

                <input placeholder="Selling"
                  onChange={(e)=>updateVariant(i,"sellingPrice",e.target.value)}
                />

                <input value={v.sku} readOnly />

                <button type="button" onClick={()=>removeVariant(i)}>X</button>

              </div>
            ))}

            <button type="button" onClick={addVariant}>Add Variant</button>
          </>
        )}

        <button>Add Product</button>

      </form>

      <style jsx>{`
        .container{max-width:900px;margin:auto}
        input,select,textarea{width:100%;margin:10px 0;padding:10px}
        .row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 2fr auto;gap:10px}
      `}</style>

    </div>
  );
}
