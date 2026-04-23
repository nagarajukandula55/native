"use client";

import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function ProductUpload() {

  /* ================= CORE ================= */

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
  const [imagePreviews, setImagePreviews] = useState([]);
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: "",
  });

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const barcodeRefs = useRef([]);

  /* ================= GST ================= */

  const gstOptions = [
    { name: "Food Preparations (Not Elsewhere Specified)", hsn: "2106", tax: 5, desc: "Includes dosa mix, idli mix" },
    { name: "Flours & Meals (Cereal Based)", hsn: "1101", tax: 5, desc: "Cereal flours" },
    { name: "Spices", hsn: "0910", tax: 5, desc: "Masalas & spices" },
    { name: "Edible Oils", hsn: "1515", tax: 5, desc: "Vegetable oils" },
    { name: "Prepared / Preserved Foods", hsn: "2001", tax: 12, desc: "Pickles, chutneys" },
    { name: "Ready to Eat / Packaged Food", hsn: "1904", tax: 12, desc: "Packaged food" },
    { name: "Namkeen / Snack Items", hsn: "2106", tax: 12, desc: "Snacks" },
  ];

  const websiteCategories = [
    "Instant Mixes","Spices & Masalas","Cold Pressed Oils",
    "Flours & Millets","Ready to Cook","Ready to Eat",
    "Pickles & Chutneys","Snacks & Namkeen",
    "Breakfast Essentials","Combo Packs","New Arrivals",
  ];

  /* ================= AUTO ================= */

  useEffect(() => {
    if (!form.name) return;

    const clean = form.name.replace(/native/gi, "").trim();
    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setProductKey(key);

    const slugGen = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setSlug(slugGen);

    setSeo({
      title: `${form.name} | Buy Online`,
      description: `Buy ${form.name} at best price`,
      keywords: `${form.name}, online, buy`,
    });

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
    updated[i] = { ...updated[i], [field]: value };

    if (updated[i].value && productKey) {
      const seq = String(i + 1).padStart(3, "0");
      updated[i].sku =
        `NA-${productKey}-${seq}-${updated[i].value}${updated[i].unit}`;
    }

    setForm(prev => ({ ...prev, variants: updated }));
  }

  function addVariant() {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  }

  function removeVariant(i) {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== i),
    }));
  }

  /* ================= VALIDATION ================= */

  function validate() {
    if (!form.name) return "Product name required";
    if (!form.category) return "Category required";
    if (!form.gstCategory) return "GST category required";

    const invalidVariant = form.variants.find(
      v => !v.value || !v.mrp || !v.sellingPrice
    );

    if (invalidVariant) return "Fill all variant fields";
    return null;
  }

  /* ================= BARCODE ================= */

  useEffect(() => {
    form.variants.forEach((v, i) => {
      if (barcodeRefs.current[i] && v.sku) {
        JsBarcode(barcodeRefs.current[i], v.sku);
      }
    });
  }, [form.variants]);

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    const err = validate();
    if (err) return setError(err);

    setError("");

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
          status: "review",
        }),
      });
    }

    alert("Product sent for review ✔");
    setForm(emptyForm);
    setStep(0);
  }

  /* ================= UI ================= */

  return (
    <div className="container">

      <h1>🛒 Product Admin Panel</h1>

      {error && <div className="error">{error}</div>}

      {/* STEPS */}
      <div className="steps">
        {["Basic","Variants","Media","SEO"].map((s,i)=>(
          <button
            key={i}
            className={step===i ? "active":""}
            onClick={()=>setStep(i)}
          >{s}</button>
        ))}
      </div>

      {/* BASIC */}
      {step===0 && (
        <div className="card grid2">

          <input placeholder="Product Name"
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}/>

          <select value={form.category}
            onChange={e=>setForm({...form,category:e.target.value})}>
            <option>Select Category</option>
            {websiteCategories.map(c=><option key={c}>{c}</option>)}
          </select>

          <select value={form.gstCategory}
            onChange={e=>setForm({...form,gstCategory:e.target.value})}>
            <option>Select GST</option>
            {gstOptions.map(g=><option key={g.name}>{g.name}</option>)}
          </select>

          <input value={form.hsn} readOnly placeholder="HSN"/>
          <input value={form.tax} readOnly placeholder="Tax %"/>

          <textarea placeholder="Short Description"
            value={form.shortDescription}
            onChange={e=>setForm({...form,shortDescription:e.target.value})}/>

          <textarea placeholder="Full Description"
            value={form.description}
            onChange={e=>setForm({...form,description:e.target.value})}/>

          <textarea placeholder="Ingredients"
            value={form.ingredients}
            onChange={e=>setForm({...form,ingredients:e.target.value})}/>

          <input placeholder="Shelf Life"
            value={form.shelfLife}
            onChange={e=>setForm({...form,shelfLife:e.target.value})}/>

        </div>
      )}

      {/* VARIANTS */}
      {step===1 && (
        <div className="card">
          {form.variants.map((v,i)=>(
            <div className="row" key={i}>
              <input placeholder="Value" onChange={e=>updateVariant(i,"value",e.target.value)}/>
              <select onChange={e=>updateVariant(i,"unit",e.target.value)}>
                <option>GM</option><option>KG</option><option>ML</option><option>L</option>
              </select>
              <input placeholder="MRP" onChange={e=>updateVariant(i,"mrp",e.target.value)}/>
              <input placeholder="Selling Price" onChange={e=>updateVariant(i,"sellingPrice",e.target.value)}/>
              <input value={v.sku} readOnly/>
              <svg ref={el=>barcodeRefs.current[i]=el}/>
              <button onClick={()=>removeVariant(i)}>X</button>
            </div>
          ))}
          <button onClick={addVariant}>+ Add Variant</button>
        </div>
      )}

      {/* ACTIONS */}
      <div className="actions">
        {step>0 && <button onClick={()=>setStep(step-1)}>Back</button>}
        {step<3 && <button onClick={()=>setStep(step+1)}>Next</button>}
        {step===3 && <button onClick={handleSubmit}>Send for Review</button>}
      </div>

      <style jsx>{`
        .container{max-width:1100px;margin:auto;padding:20px;}
        .card{background:#fff;padding:20px;border-radius:12px;margin-top:15px;}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:15px;}
        .row{display:grid;grid-template-columns:repeat(5,1fr) auto;gap:10px;margin-bottom:10px;}
        input,select,textarea{padding:10px;border:1px solid #ddd;border-radius:6px;}
        textarea{grid-column:span 2;}
        .steps button{margin:5px;padding:8px 12px;border-radius:6px;}
        .active{background:black;color:#fff;}
        .actions{margin-top:20px;display:flex;gap:10px;}
        .error{color:red;margin:10px 0;}
      `}</style>

    </div>
  );
}
