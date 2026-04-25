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

    // 🔥 NEW FIELDS
    fssaiNumber: "",
    manufacturerName: "",
    manufacturerAddress: "",
    countryOfOrigin: "India",
    storageInstructions: "",
    allergenInfo: "",
    packedDate: "",
    expiryDate: "",

    // 🔥 Nutrition (basic structure)
    nutrition: {
      energy: "",
      protein: "",
      carbs: "",
      fat: "",
    },

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
    { name: "Food Preparations", hsn: "2106", tax: 5 },
    { name: "Flours", hsn: "1101", tax: 5 },
    { name: "Spices", hsn: "0910", tax: 5 },
    { name: "Oils", hsn: "1515", tax: 5 },
    { name: "Pickles", hsn: "2001", tax: 12 },
  ];

  const websiteCategories = [
    "Instant Mixes",
    "Spices & Masalas",
    "Flours & Millets",
    "Ready to Eat",
  ];

  /* ================= AUTO GENERATORS ================= */

  useEffect(() => {
    if (!form.name) return;

    const key = form.name.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    setProductKey(key);

    const slugGen = form.name.toLowerCase().replace(/\s+/g, "-");
    setSlug(slugGen);

    setSeo({
      title: `${form.name} | Buy Online`,
      description: `Buy ${form.name} at best price`,
      keywords: `${form.name}, buy online`,
    });
  }, [form.name]);

  useEffect(() => {
    const selected = gstOptions.find(g => g.name === form.gstCategory);
    if (selected) {
      setForm(prev => ({
        ...prev,
        hsn: selected.hsn,
        tax: selected.tax,
      }));
    }
  }, [form.gstCategory]);

  /* ================= VARIANTS ================= */

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
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  }

  /* ================= IMAGE ================= */

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    const previews = files.map(f => ({
      preview: URL.createObjectURL(f),
    }));

    setImagePreviews(prev => [...prev, ...previews]);

    const uploaded = [];

    for (let file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "native_upload");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );

      const json = await res.json();
      if (json?.secure_url) uploaded.push(json.secure_url);
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...uploaded],
    }));
  }

  /* ================= VALIDATION ================= */

  function validate() {
    if (!form.name) return "Product name required";
    if (!form.images.length) return "Upload image required";
    if (!form.fssaiNumber) return "FSSAI required";
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

  /* ================= SAVE ================= */

  async function handleSubmit() {
    const err = validate();
    if (err) return setError(err);

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

    alert("Submitted ✔");
  }

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1100, margin: "auto", padding: 20 }}>

      <h1>🛒 Product Admin</h1>

      {/* PROGRESS */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ height: 6, background: "#eee" }}>
          <div style={{
            width: `${(step / 4) * 100}%`,
            background: "green",
            height: "100%"
          }} />
        </div>
      </div>

      {/* STEP NAV */}
      <div style={{ display: "flex", gap: 10 }}>
        {["Basic", "Variants", "Media", "Compliance", "SEO"].map((s, i) => (
          <button key={i} onClick={() => setStep(i)}>{s}</button>
        ))}
      </div>

      {/* STEP 0 */}
      {step === 0 && (
        <div>
          <input placeholder="Product Name (Eg: Dosa Mix)"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} />

          <select onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>Select Category</option>
            {websiteCategories.map(c => <option key={c}>{c}</option>)}
          </select>

          <select onChange={e => setForm({ ...form, gstCategory: e.target.value })}>
            <option>Select GST</option>
            {gstOptions.map(g => <option key={g.name}>{g.name}</option>)}
          </select>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          {form.variants.map((v, i) => (
            <div key={i}>
              <input placeholder="Weight (Eg: 500)"
                onChange={e => updateVariant(i, "value", e.target.value)} />
              <input placeholder="MRP"
                onChange={e => updateVariant(i, "mrp", e.target.value)} />
              <input placeholder="Selling Price"
                onChange={e => updateVariant(i, "sellingPrice", e.target.value)} />
              <input value={v.sku} readOnly />
              <svg ref={el => barcodeRefs.current[i] = el} />
            </div>
          ))}
          <button onClick={addVariant}>Add Variant</button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <input type="file" multiple onChange={handleImageUpload} />
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div>
          <input placeholder="FSSAI Number"
            onChange={e => setForm({ ...form, fssaiNumber: e.target.value })} />

          <input placeholder="Manufacturer Name"
            onChange={e => setForm({ ...form, manufacturerName: e.target.value })} />

          <textarea placeholder="Manufacturer Address"
            onChange={e => setForm({ ...form, manufacturerAddress: e.target.value })} />

          <input placeholder="Storage Instructions"
            onChange={e => setForm({ ...form, storageInstructions: e.target.value })} />

          <input placeholder="Allergen Info"
            onChange={e => setForm({ ...form, allergenInfo: e.target.value })} />
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div>
          <input value={seo.title}
            onChange={e => setSeo({ ...seo, title: e.target.value })} />
          <textarea value={seo.description}
            onChange={e => setSeo({ ...seo, description: e.target.value })} />
        </div>
      )}

      {/* ACTION */}
      <div style={{ marginTop: 20 }}>
        {step > 0 && <button onClick={() => setStep(step - 1)}>Back</button>}
        {step < 4 && <button onClick={() => setStep(step + 1)}>Next</button>}
        {step === 4 && <button onClick={handleSubmit}>Submit</button>}
      </div>

    </div>
  );
}
