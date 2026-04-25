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
    stock: "",
  };

  const emptyForm = {
    name: "",
    brand: "",
    category: "",
    tags: "",

    gstCategory: "",
    gstDescription: "",
    hsn: "",
    tax: "",

    description: "",
    shortDescription: "",
    ingredients: "",
    shelfLife: "",

    subcategory: "",
    highlights: "",
    productType: "Veg",

    // ✅ COMPLIANCE
    fssaiNumber: "",
    manufacturerName: "",
    manufacturerAddress: "",
    batchNumber: "",
    packingDate: "",
    expiryDate: "",
    netQuantity: "",
    vegType: "Veg",
    countryOfOrigin: "India",
    storageInstructions: "",
    allergenInfo: "",

    // ✅ SHIPPING
    weight: "",
    length: "",
    breadth: "",
    height: "",

    // ✅ SEO
    images: [],
    variants: [emptyVariant],
  };

  const [form, setForm] = useState(emptyForm);
  const [productKey, setProductKey] = useState("");
  const [slug, setSlug] = useState("");
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: "",
  });

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  const barcodeRefs = useRef([]);

  const categoryMap = {
    "Instant Mixes": ["Dosa Mix", "Idli Mix", "Ragi Mix"],
    "Spices & Masalas": ["Chilli Powder", "Garam Masala"],
    "Oils": ["Groundnut Oil", "Coconut Oil"],
  };

  /* ================= GST ================= */

  const gstOptions = [
    { name: "Food Preparations", hsn: "2106", tax: 5 },
    { name: "Flours", hsn: "1101", tax: 5 },
    { name: "Spices", hsn: "0910", tax: 5 },
  ];

  /* ================= AUTO ================= */

  useEffect(() => {
    if (!form.name) return;
  
    const slugGen = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  
    setSlug(slugGen);
  
    const words = form.name.toLowerCase().split(" ");
  
    const autoTags = [
      ...words,
      form.category?.toLowerCase(),
      form.subcategory?.toLowerCase(),
      "buy online",
      "best price",
    ];
  
    setForm(prev => ({
      ...prev,
      tags: autoTags.filter(Boolean).join(", "),
    }));
  
    setSeo({
      title: `${form.name} | Buy Online`,
      description: `Buy ${form.name} online at best price`,
      keywords: autoTags.join(", "),
    });
  
  }, [form.name, form.category, form.subcategory]);

  useEffect(() => {
    const gst = gstOptions.find(g => g.name === form.gstCategory);
    if (gst) {
      setForm(prev => ({
        ...prev,
        hsn: gst.hsn,
        tax: gst.tax,
      }));
    }
  }, [form.gstCategory]);

/* =============== AI Content ============== */
  
 async function generateAIContent() {
  try {
    /* ✅ VALIDATION FIRST */
    if (!form.ingredients || !form.ingredients.trim()) {
      alert("Please enter ingredients before generating content");
      return;
    }

    /* ✅ FORMAT INGREDIENTS */
    const cleanedIngredients = formatIngredients(form.ingredients).join(", ");

    const res = await fetch("/api/ai-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        subcategory: form.subcategory,
        ingredients: cleanedIngredients,
      }),
    });

    const data = await res.json();

    console.log("AI RESPONSE:", data); // 🔥 Debug

    if (!data.success) {
      alert("AI generation failed");
      return;
    }

    const c = data.content || {};

    /* ✅ UPDATE FORM */
    setForm(prev => ({
      ...prev,
      highlights: c.highlights?.join(", ") || prev.highlights || "",
      shortDescription: c.shortDescription || prev.shortDescription || "",
      description: c.description || prev.description || "",
    }));

    /* ✅ UPDATE SEO */
    setSeo(prev => ({
      title: c.seo?.title || prev.title || "",
      description: c.seo?.description || prev.description || "",
      keywords: c.seo?.keywords || prev.keywords || "",
    }));

  } catch (err) {
    console.error("AI ERROR:", err);
    alert("Something went wrong while generating content");
  }
}
  
  /* ================= VARIANTS ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];

    updated[i][field] = value;

    if (updated[i].value && productKey) {
      updated[i].sku = `NA-${productKey}-${i + 1}-${updated[i].value}${updated[i].unit}`;
    }

    setForm(prev => ({ ...prev, variants: updated }));
  }

  function addVariant() {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  }

  /* ================= Clean Ingredients ================= */

    function formatIngredients(raw) {
    if (!raw) return [];
  
    return raw
      .split(",")
      .map(i => i.trim())
      .filter(Boolean);
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

      if (json.secure_url) uploaded.push(json.secure_url);
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...uploaded],
    }));
  }

  /* ================= VALIDATION ================= */

  function validate() {
    if (!form.name) return "Product name required";
    if (!form.category) return "Category required";
    if (!form.fssaiNumber) return "FSSAI required";
    if (!form.images.length) return "Upload image";

    const invalid = form.variants.find(
      v => !v.value || !v.mrp || !v.sellingPrice
    );

    if (invalid) return "Variant incomplete";

    return null;
  }

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

    alert("Saved ✔");
    setForm(emptyForm);
  }

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1100, margin: "auto", padding: 20 }}>

      <h1>Product Admin</h1>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* PROGRESS */}
      <div style={{ display: "flex", marginBottom: 10 }}>
        {["Basic", "Variants", "Media", "Compliance"].map((s, i) => (
          <div key={i} style={{
            flex: 1,
            padding: 8,
            background: step >= i ? "green" : "#ddd",
            color: "#fff"
          }}>{s}</div>
        ))}
      </div>

      {/* BASIC */}
      {step === 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 15,
          padding: 20,
          background: "#fff"
        }}>
      
          {/* NAME */}
          <input
            placeholder="Product Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
      
          {/* BRAND */}
          <select
            value={form.brand}
            onChange={e => setForm({ ...form, brand: e.target.value })}
          >
            <option>Select Brand</option>
            <option>Native</option>
            <option>AN</option>
          </select>
      
          {/* CATEGORY */}
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value, subcategory: "" })}
          >
            <option>Select Category</option>
            {Object.keys(categoryMap).map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
      
          {/* SUBCATEGORY */}
          <select
            value={form.subcategory}
            onChange={e => setForm({ ...form, subcategory: e.target.value })}
          >
            <option>Select Subcategory</option>
            {(categoryMap[form.category] || []).map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
      
          {/* SHORT DESC */}
          <textarea
            placeholder="Short Description"
            value={form.shortDescription}
            onChange={e => setForm({ ...form, shortDescription: e.target.value })}
            style={{ gridColumn: "span 2" }}
          />
      
          {/* FULL DESC */}
          <textarea
            placeholder="Full Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ gridColumn: "span 2" }}
          />
      
          {/* HIGHLIGHTS */}
          <textarea
            placeholder="Highlights"
            value={form.highlights}
            onChange={e => setForm({ ...form, highlights: e.target.value })}
            style={{ gridColumn: "span 2" }}
          />
      
          {/* TAGS */}
          <input value={form.tags} readOnly />
      
          {/* SLUG */}
          <input value={slug} readOnly />
      
          {/* SEO */}
          <input value={seo.title} readOnly />
          <textarea value={seo.description} readOnly />

          {/*Ingredients */}
          <textarea
            placeholder="Ingredients (comma separated)
          Example: Rice, Urad Dal, Fenugreek Seeds, Salt"
            value={form.ingredients}
            onChange={e =>
              setForm({ ...form, ingredients: e.target.value })
            }
            style={{ gridColumn: "span 2" }}
          />
      
          {/* BUTTON */}
          <button
            type="button"
            onClick={generateAIContent}
            style={{
              gridColumn: "span 2",
              background: "black",
              color: "white",
              padding: 10
            }}
          >
            ⚡ Generate Content
          </button>
      
        </div>
      )}

      {/* VARIANTS */}
      {step === 1 && (
        <div>
          {form.variants.map((v, i) => (
            <div key={i}>
              <input placeholder="Value"
                onChange={e => updateVariant(i, "value", e.target.value)} />

              <input placeholder="MRP"
                onChange={e => updateVariant(i, "mrp", e.target.value)} />

              <input placeholder="Selling Price"
                onChange={e => updateVariant(i, "sellingPrice", e.target.value)} />

              <input placeholder="Stock"
                onChange={e => updateVariant(i, "stock", e.target.value)} />

              <input value={v.sku} readOnly />
            </div>
          ))}

          <button onClick={addVariant}>Add Variant</button>
        </div>
      )}

      {/* MEDIA */}
      {step === 2 && (
        <input type="file" multiple onChange={handleImageUpload} />
      )}

      {/* COMPLIANCE */}
      {step === 3 && (
        <div>
          <input placeholder="FSSAI Number"
            onChange={e => setForm({ ...form, fssaiNumber: e.target.value })} />

          <input placeholder="Manufacturer"
            onChange={e => setForm({ ...form, manufacturerName: e.target.value })} />

          <input placeholder="Batch Number"
            onChange={e => setForm({ ...form, batchNumber: e.target.value })} />

          <input type="date"
            onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
        </div>
      )}

      {/* ACTION */}
      <div>
        {step > 0 && <button onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 && <button onClick={() => setStep(step + 1)}>Next</button>}
        {step === 3 && <button onClick={handleSubmit}>Submit</button>}
      </div>

    </div>
  );
}
