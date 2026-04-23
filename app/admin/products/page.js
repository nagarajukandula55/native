"use client";

import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

export default function ProductUpload() {
  const barcodeRef = useRef(null);
  const qrRef = useRef(null);

  /* ================= CORE (UNCHANGED STRUCTURE) ================= */

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

  const [status] = useState("draft");

  /* ================= VALIDATION ERROR LOCK ================= */

  const [errors, setErrors] = useState([]);

  /* ================= GST CONFIG (UNCHANGED LOGIC) ================= */

  const gstOptions = [
    { name: "Food Preparations (Not Elsewhere Specified)", hsn: "2106", tax: 5, desc: "Includes dosa mix, idli mix, etc." },
    { name: "Flours & Meals (Cereal Based)", hsn: "1101", tax: 5, desc: "Flours of cereals, pulses, millets" },
    { name: "Spices", hsn: "0910", tax: 5, desc: "Spices including masalas" },
    { name: "Edible Oils", hsn: "1515", tax: 5, desc: "Vegetable oils" },
    { name: "Prepared / Preserved Foods", hsn: "2001", tax: 12, desc: "Pickles, chutneys" },
    { name: "Ready to Eat / Packaged Food", hsn: "1904", tax: 12, desc: "Packaged food" },
    { name: "Namkeen / Snack Items", hsn: "2106", tax: 12, desc: "Snacks" },
  ];

  const websiteCategories = [
    "Instant Mixes","Spices & Masalas","Cold Pressed Oils","Flours & Millets",
    "Ready to Cook","Ready to Eat","Pickles & Chutneys","Snacks & Namkeen",
    "Breakfast Essentials","Combo Packs","New Arrivals",
  ];

  /* ================= AUTO SEO + SKU KEY ================= */

  useEffect(() => {
    if (!form.name) return;

    const clean = form.name.replace(/native/gi, "").trim();
    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");

    setProductKey(key);
    setSlug(
      form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    );

    setSeo({
      title: `${form.name} | Premium Branded Product`,
      description: `Buy ${form.name} online at best price. 100% quality assured.`,
      keywords: `${form.name}, buy online, premium product`,
    });
  }, [form.name]);

  /* ================= GST AUTO FIX (STABLE) ================= */

  useEffect(() => {
    const selected = gstOptions.find(g => g.name === form.gstCategory);
    if (!selected) return;

    setForm(prev => ({
      ...prev,
      hsn: selected.hsn || "",
      tax: selected.tax || "",
      gstDescription: selected.desc || "",
    }));
  }, [form.gstCategory]);

  /* ================= VARIANT UPDATE (FIXED) ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];
    updated[i] = { ...updated[i], [field]: value };

    if (updated[i].value && productKey) {
      const seq = String(i + 1).padStart(3, "0");
      updated[i].sku = `NA-${productKey}-${seq}-${updated[i].value}${updated[i].unit}`;
    }

    setForm(prev => ({ ...prev, variants: updated }));
  }

  function addVariant() {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, emptyVariant],
    }));
  }

  function removeVariant(i) {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== i),
    }));
  }

  /* ================= IMAGE UPLOAD ================= */

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    const previews = files.map(f => ({
      preview: URL.createObjectURL(f),
      uploading: true,
    }));

    setImagePreviews(prev => [...prev, ...previews]);

    const uploaded = [];

    for (let i = 0; i < files.length; i++) {
      const data = new FormData();
      data.append("file", files[i]);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );

      const json = await res.json();
      uploaded.push(json.secure_url);
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...uploaded],
    }));
  }

  /* ================= BARCODE + QR ================= */

  useEffect(() => {
    if (!productKey) return;

    const value = `NA-${productKey}-MASTER`;

    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, value, {
        format: "CODE128",
        width: 2,
        height: 70,
        displayValue: true,
      });
    }

    QRCode.toCanvas(qrRef.current, value, { width: 120 });
  }, [productKey]);

  /* ================= VALIDATION ENGINE (LOCK SYSTEM) ================= */

  function validate() {
    const err = [];

    if (!form.name) err.push("Product Name required");
    if (!form.category) err.push("Category required");
    if (!form.gstCategory) err.push("GST Category required");
    if (!form.images.length) err.push("At least 1 image required");

    const validVariants = form.variants.filter(v => v.value && v.mrp && v.sellingPrice);

    if (!validVariants.length) err.push("At least 1 valid variant required");

    setErrors(err);
    return err.length === 0;
  }

  /* ================= SUBMIT (LOCKED SAFE SAVE) ================= */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      alert("Fix errors before saving");
      return;
    }

    for (let v of form.variants) {
      if (!v.value) continue;

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

    alert("Product Published Successfully");
  }

  /* ================= UI ================= */

  return (
    <div className="wrap">

      <h1>Shopify Pro Product Admin (LOCKED SYSTEM)</h1>

      {errors.length > 0 && (
        <div className="errors">
          {errors.map((e,i)=> <p key={i}>⚠ {e}</p>)}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <input placeholder="Product Name"
          value={form.name}
          onChange={(e)=>setForm({...form,name:e.target.value})}
        />

        <select onChange={(e)=>setForm({...form,category:e.target.value})}>
          <option>Select Category</option>
          {websiteCategories.map(c => <option key={c}>{c}</option>)}
        </select>

        <select onChange={(e)=>setForm({...form,gstCategory:e.target.value})}>
          <option>Select GST Category</option>
          {gstOptions.map(g =>
            <option key={g.name} value={g.name}>{g.name} ({g.tax}%)</option>
          )}
        </select>

        <input value={form.hsn} readOnly />
        <input value={form.tax} readOnly />
        <textarea value={form.gstDescription} readOnly />

        {/* VARIANTS */}
        {form.variants.map((v,i)=>(
          <div key={i} className="row">
            <input placeholder="Value"
              onChange={(e)=>updateVariant(i,"value",e.target.value)} />

            <select onChange={(e)=>updateVariant(i,"unit",e.target.value)}>
              <option>GM</option><option>KG</option><option>ML</option><option>L</option>
            </select>

            <input placeholder="MRP"
              onChange={(e)=>updateVariant(i,"mrp",e.target.value)} />

            <input placeholder="Selling Price"
              onChange={(e)=>updateVariant(i,"sellingPrice",e.target.value)} />

            <input value={v.sku} readOnly />
          </div>
        ))}

        <button type="button" onClick={addVariant}>+ Add Variant</button>

        {/* IMAGE */}
        <input type="file" multiple onChange={handleImageUpload} />

        <div className="imgGrid">
          {imagePreviews.map((img,i)=>(
            <img key={i} src={img.preview} />
          ))}
        </div>

        {/* BARCODE + QR */}
        <canvas ref={barcodeRef}></canvas>
        <canvas ref={qrRef}></canvas>

        <button type="submit">FINAL PUBLISH (LOCKED)</button>

      </form>

      <style jsx>{`
        .wrap{max-width:1100px;margin:auto;padding:20px;}
        input,select,textarea{width:100%;padding:10px;margin:8px 0;}
        .row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;}
        .imgGrid{display:flex;gap:10px;flex-wrap:wrap;}
        img{width:80px;height:80px;object-fit:cover;}
        .errors{background:#ffe5e5;padding:10px;margin-bottom:10px;}
      `}</style>

    </div>
  );
}
