"use client";

import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

/* ================= COMPONENT ================= */

export default function ProductUpload() {

  /* ================= CORE (UNCHANGED) ================= */

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

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");

  const barcodeRefs = useRef([]);

  /* ================= NEW: PRODUCT STATUS SYSTEM ================= */

  const [status, setStatus] = useState("draft"); 
  // draft → review → approved → rejected

  /* ================= GST CONFIG ================= */

  const gstOptions = [
    { name: "Food Preparations (Not Elsewhere Specified)", hsn: "2106", tax: 5, desc: "Includes dosa mix, idli mix" },
    { name: "Flours & Meals (Cereal Based)", hsn: "1101", tax: 5, desc: "Cereal flours" },
    { name: "Spices", hsn: "0910", tax: 5, desc: "Masalas & spices" },
    { name: "Edible Oils", hsn: "1515", tax: 5, desc: "Vegetable oils" },
    { name: "Prepared / Preserved Foods", hsn: "2001", tax: 12, desc: "Pickles, chutneys" },
    { name: "Ready to Eat / Packaged Food", hsn: "1904", tax: 12, desc: "Packaged foods" },
    { name: "Namkeen / Snack Items", hsn: "2106", tax: 12, desc: "Snacks" },
  ];

  const websiteCategories = [
    "Instant Mixes","Spices & Masalas","Cold Pressed Oils",
    "Flours & Millets","Ready to Cook","Ready to Eat",
    "Pickles & Chutneys","Snacks & Namkeen",
    "Breakfast Essentials","Combo Packs","New Arrivals"
  ];

  /* ================= AUTO ================= */

  useEffect(() => {
    if (!form.name) return;

    const clean = form.name.replace(/native/gi, "").trim();
    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");

    setProductKey(key);

    const slugGen = form.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setSlug(slugGen);

    setSeo({
      title: `${form.name} | Buy Online`,
      description: `Buy ${form.name} at best price.`,
      keywords: `${form.name}, buy online`
    });

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

  /* ================= VARIANTS ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];
    updated[i][field] = value;

    if (updated[i].value && productKey) {
      const seq = String(i + 1).padStart(3, "0");
      updated[i].sku = `NA-${productKey}-${seq}-${updated[i].value}${updated[i].unit}`;
    }

    setForm(prev => ({ ...prev, variants: updated }));
  }

  function addVariant() {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, emptyVariant]
    }));
  }

  /* ================= BARCODE ================= */

  useEffect(() => {
    form.variants.forEach((v, i) => {
      if (barcodeRefs.current[i] && v.sku) {
        JsBarcode(barcodeRefs.current[i], v.sku, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
        });
      }
    });
  }, [form.variants]);

  /* ================= VALIDATION ================= */

  function validateStep() {
    if (activeStep === 0 && (!form.name || !form.category)) {
      setError("Basic details missing");
      return false;
    }
    if (activeStep === 1 && form.variants.length === 0) {
      setError("Add variants");
      return false;
    }
    setError("");
    return true;
  }

  function nextStep() {
    if (validateStep()) setActiveStep(p => p + 1);
  }

  function prevStep() {
    setActiveStep(p => p - 1);
  }

  /* ================= SUBMIT (🔥 UPDATED WORKFLOW) ================= */

  async function handleSubmit() {
    if (!validateStep()) return;

    /* 🔥 IMPORTANT: always send for REVIEW first */
    const finalStatus = "review";

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
          status: finalStatus   // 🔥 REVIEW FLOW LOCKED
        }),
      });
    }

    alert("Product sent for REVIEW (awaiting approval)");

    window.location.href = "/admin/products"; 
  }

  /* ================= PRINT (UNCHANGED) ================= */

  async function printStickers() {
    const win = window.open("", "_blank");

    let html = `
      <html>
      <head>
        <style>
          body { font-family: Arial; }
          .sheet { display:grid; grid-template-columns: repeat(3,1fr); gap:10px; }
          .sticker { border:1px solid #000; padding:10px; text-align:center; }
        </style>
      </head>
      <body><div class="sheet">
    `;

    for (let v of form.variants) {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, v.sku, { format: "CODE128" });

      const qr = await QRCode.toDataURL(v.sku);

      html += `
        <div class="sticker">
          <b>${form.name}</b><br/>
          ${v.value}${v.unit}<br/>
          <img src="${canvas.toDataURL()}" /><br/>
          <small>${v.sku}</small><br/>
          <img src="${qr}" width="60"/>
        </div>
      `;
    }

    html += "</div></body></html>";

    win.document.write(html);
    win.document.close();
    win.print();
  }

  /* ================= UI (UNCHANGED STRUCTURE) ================= */

  return (
    <div className="wrap">

      <h1>🚀 Shopify Pro Locked Admin</h1>

      <p>Status: <b>{status.toUpperCase()}</b> (Auto → REVIEW on save)</p>

      {activeStep === 0 && (
        <>
          <input placeholder="Product Name"
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}
          />

          <select onChange={e=>setForm({...form,category:e.target.value})}>
            {websiteCategories.map(c=><option key={c}>{c}</option>)}
          </select>

          <select onChange={e=>setForm({...form,gstCategory:e.target.value})}>
            {gstOptions.map(g=><option key={g.name}>{g.name}</option>)}
          </select>

          <input value={form.hsn} readOnly />
          <input value={form.tax} readOnly />
        </>
      )}

      {activeStep === 1 && (
        <>
          {form.variants.map((v,i)=>(
            <div key={i}>
              <input onChange={e=>updateVariant(i,"value",e.target.value)} />
              <input value={v.sku} readOnly />
              <svg ref={el=>barcodeRefs.current[i]=el}></svg>
            </div>
          ))}

          <button onClick={addVariant}>Add Variant</button>
        </>
      )}

      <div>
        {activeStep>0 && <button onClick={prevStep}>Back</button>}
        {activeStep<1 && <button onClick={nextStep}>Next</button>}
        {activeStep===1 && <button onClick={handleSubmit}>Send for Approval</button>}
      </div>

      <button onClick={printStickers}>Print Stickers</button>

    </div>
  );
}
