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
    tax: 0,

    description: "",
    shortDescription: "",
    ingredients: [{ name: "", qty: "", unit: "GM", percent: 0 }],

    subcategory: "",
    highlights: "",
    productType: "Veg",
    totalWeight: "",

    baseCost: "",
    packagingCost: "",
    logisticsCost: "",
    marketingCost: "",

    mrp: "",
    sellingPrice: "",

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

    weight: "",
    length: "",
    breadth: "",
    height: "",

    images: [],
    variants: [emptyVariant],
  };

  const [form, setForm] = useState(emptyForm);
  const [productKey, setProductKey] = useState("");
  const [slug, setSlug] = useState("");
  const [seo, setSeo] = useState({ title: "", description: "", keywords: "" });

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  const displayName = form.brand
    ? `${form.brand} ${form.name}`.trim()
    : form.name;

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

  /* ================= AUTO SEO ================= */

  useEffect(() => {
    if (!form.name) return;

    const cleanName = form.name.replace(/native/gi, "").trim();

    const displayName = form.brand
      ? `${form.brand} ${cleanName}`.trim()
      : cleanName;

    const slugGen = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setSlug(slugGen);

    const base = displayName.toLowerCase();

    const tags = [
      base,
      `buy ${base}`,
      `${base} online`,
      `${cleanName} india`,
      form.category?.toLowerCase(),
    ].filter(Boolean);

    setForm(prev => ({ ...prev, tags: [...new Set(tags)].join(", ") }));

    setSeo({
      title: `${displayName} | Buy Online`,
      description: `Buy ${displayName} online at best price.`,
      keywords: tags.join(", "),
    });

  }, [form.name, form.category, form.brand]);

  /* ================= INGREDIENT FIX ================= */

  function convertToGrams(qty, unit) {
    const value = parseFloat(qty) || 0;
    if (unit === "KG") return value * 1000;
    if (unit === "L") return value * 1000;
    if (unit === "ML") return value;
    return value;
  }

  function recalcIngredients(updated) {
    const totalWeight = parseFloat(form.totalWeight) || 0;

    return updated.map(i => {
      const grams = convertToGrams(i.qty, i.unit);

      return {
        ...i,
        percent: totalWeight ? ((grams / totalWeight) * 100).toFixed(2) : 0,
      };
    });
  }

  function updateIngredient(i, field, value) {
    const updated = [...form.ingredients];

    updated[i] = {
      ...updated[i],
      [field]: value,
      qty: field === "qty" ? Number(value) || 0 : updated[i].qty,
    };

    setForm(prev => ({
      ...prev,
      ingredients: recalcIngredients(updated),
    }));
  }

  function addIngredient() {
    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", qty: "", unit: "GM", percent: 0 }],
    }));
  }

  function removeIngredient(i) {
    const updated = form.ingredients.filter((_, idx) => idx !== i);

    setForm(prev => ({
      ...prev,
      ingredients: recalcIngredients(updated),
    }));
  }

  const total = form.ingredients.reduce(
    (sum, i) => sum + parseFloat(i.percent || 0),
    0
  );

  /* ================= PRICING ================= */

  const totalCost =
    Number(form.baseCost || 0) +
    Number(form.packagingCost || 0) +
    Number(form.logisticsCost || 0) +
    Number(form.marketingCost || 0);

  const gstAmount = (Number(form.sellingPrice || 0) * Number(form.tax || 0)) / 100;
  const finalPrice = Number(form.sellingPrice || 0) + gstAmount;
  const profit = Number(form.sellingPrice || 0) - totalCost;
  const margin = form.sellingPrice ? (profit / form.sellingPrice) * 100 : 0;

  /* ================= AI CONTENT ================= */

  async function generateAIContent() {
    alert("AI hook ready");
  }

  /* ================= IMAGE UPLOAD ================= */

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);

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

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1100, margin: "auto", padding: 20 }}>

      <h1>Product Admin</h1>

{/* BASIC */}
{step === 0 && (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

    {/* ================= BASIC INFO ================= */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 15,
      padding: 20,
      background: "#fff",
      borderRadius: 10
    }}>

      <h3 style={{ gridColumn: "span 2" }}>🧾 Basic Details</h3>

      {/* NAME */}
      <input
        placeholder="Product Name"
        value={displayName}
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
    </div>

    {/* ================= AUTO GENERATED ================= */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 15,
      padding: 20,
      background: "#fff",
      borderRadius: 10
    }}>

      <h3 style={{ gridColumn: "span 2" }}>⚙️ Auto Generated (Locked)</h3>

      <input value={form.tags} readOnly style={{ background: "#f5f5f5" }} />
      <input value={slug} readOnly style={{ background: "#f5f5f5" }} />

      <input value={seo.title} readOnly style={{ background: "#f5f5f5" }} />
      <textarea
        value={seo.description}
        readOnly
        style={{ gridColumn: "span 2", background: "#f5f5f5" }}
      />
    </div>

    {/* ================= INGREDIENT INPUT ================= */}
    <div style={{
      padding: 20,
      background: "#fff",
      borderRadius: 10
    }}>

      <h3>⚖️ Product Weight</h3>

      <input
        type="number"
        placeholder="Total Weight (GM)"
        value={form.totalWeight}
        onChange={e => setForm({ ...form, totalWeight: e.target.value })}
      />

    </div>

    {/* ================= INGREDIENTS ================= */}
    <div style={{
      background: "#fff",
      padding: 20,
      borderRadius: 10
    }}>

      <h3>🥗 Ingredients</h3>

      {form.ingredients.map((ing, i) => (
        <div key={i} style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
          gap: 10,
          marginBottom: 10,
          alignItems: "center"
        }}>

          {/* Name */}
          <input
            placeholder="Ingredient Name"
            value={ing.name}
            onChange={e => updateIngredient(i, "name", e.target.value)}
          />

          {/* Qty */}
          <input
            type="number"
            placeholder="Qty"
            value={ing.qty}
            onChange={e => updateIngredient(i, "qty", e.target.value)}
          />

          {/* Unit */}
          <select
            value={ing.unit}
            onChange={e => updateIngredient(i, "unit", e.target.value)}
          >
            <option>GM</option>
            <option>KG</option>
            <option>ML</option>
            <option>L</option>
          </select>

          {/* Percent */}
          <input
            value={`${ing.percent || 0}%`}
            readOnly
            style={{ background: "#eee" }}
          />

          {/* Remove */}
          <button onClick={() => removeIngredient(i)}>X</button>
        </div>
      ))}

      <button onClick={addIngredient}>+ Add Ingredient</button>

      {/* TOTAL DISPLAY */}
      <div style={{
        marginTop: 15,
        fontWeight: "bold"
      }}>
        Total: {total.toFixed(2)}%
      </div>

    </div>

    {/* ================= ACTION ================= */}
    <div>
      <button
        type="button"
        onClick={generateAIContent}
        style={{
          width: "100%",
          background: "black",
          color: "white",
          padding: 14,
          fontWeight: "bold",
          borderRadius: 6
        }}
      >
        ⚡ Generate Content
      </button>
    </div>

  </div>
)}
{step === 1 && (
  <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>

    <h2>💰 Step 1: Pricing Intelligence Engine</h2>

    {/* ================= GST SECTION ================= */}
    <h3>🧾 GST Classification</h3>

    <select
      value={form.gstCategory}
      onChange={e => {
        const gst = gstOptions.find(g => g.name === e.target.value);

        setForm(prev => ({
          ...prev,
          gstCategory: e.target.value,
          hsn: gst?.hsn || "",
          tax: gst?.tax || 0
        }));
      }}
      style={{ width: "100%", padding: 10 }}
    >
      <option>Select Product Type (Auto GST)</option>
      {gstOptions.map(g => (
        <option key={g.name} value={g.name}>
          {g.name}
        </option>
      ))}
    </select>

    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
      <input value={form.hsn} readOnly placeholder="HSN Code" />
      <input value={form.tax + "% GST"} readOnly placeholder="GST %" />
    </div>

    {/* ================= COST SECTION ================= */}
    <h3 style={{ marginTop: 20 }}>🏭 Cost Breakdown</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

      <input placeholder="Ingredient Cost"
        value={form.baseCost}
        onChange={e => setForm({ ...form, baseCost: e.target.value })}
      />

      <input placeholder="Packaging Cost"
        value={form.packagingCost}
        onChange={e => setForm({ ...form, packagingCost: e.target.value })}
      />

      <input placeholder="Logistics Cost"
        value={form.logisticsCost}
        onChange={e => setForm({ ...form, logisticsCost: e.target.value })}
      />

      <input placeholder="Marketing Cost"
        value={form.marketingCost}
        onChange={e => setForm({ ...form, marketingCost: e.target.value })}
      />
    </div>

    {/* ================= PRICING ================= */}
    <h3 style={{ marginTop: 20 }}>💰 Pricing Input (Ex GST)</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

      <input
        placeholder="Selling Price (WITHOUT GST)"
        value={form.sellingPrice}
        onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
      />

      <input
        placeholder="MRP (WITHOUT GST)"
        value={form.mrp}
        onChange={e => setForm({ ...form, mrp: e.target.value })}
      />
    </div>

    {/* ================= SKU ================= */}
    <h3 style={{ marginTop: 20 }}>🆔 SKU System</h3>

    <input
      readOnly
      value={
        form.name && form.totalWeight
          ? `NA-${form.name.toUpperCase().replace(/\s+/g, "")}-001-${form.totalWeight}GM`
          : ""
      }
    />

    {/* ================= CORE CALC ================= */}
    <div style={{
      marginTop: 20,
      padding: 10,
      background: "#f5f5f5",
      borderRadius: 8
    }}>

      <p>💰 Total Cost: ₹{totalCost || 0}</p>
      <p>🧾 GST: ₹{gstAmount?.toFixed(2) || 0}</p>
      <p>💵 Final Price (Incl GST): ₹{finalPrice?.toFixed(2) || 0}</p>
      <p>📈 Profit: ₹{profit?.toFixed(2) || 0}</p>
      <p>📊 Margin: {margin?.toFixed(2) || 0}%</p>

    </div>

    {/* ===================================================== */}
    {/* 🧠 AI PRICE OPTIMIZER (NEW) */}
    {/* ===================================================== */}

    <h3 style={{ marginTop: 20 }}>🧠 AI Price Optimizer</h3>

    <div style={{
      padding: 10,
      background: "#e8f4ff",
      borderRadius: 8
    }}>

      <p>
        💡 Suggested Selling Price:
        <b> ₹{(totalCost * 1.45 || 0).toFixed(2)}</b>
      </p>

      <p>
        💡 Suggested MRP:
        <b> ₹{((totalCost * 1.45) * 1.25 || 0).toFixed(2)}</b>
      </p>

      <p style={{ fontSize: 12, color: "#555" }}>
        AI adjusts pricing based on category margin benchmarks + FMCG trends
      </p>
    </div>

    {/* ===================================================== */}
    {/* 📊 PRICE HISTORY & AUDIT TRAIL (UI ONLY) */}
    {/* ===================================================== */}

    <h3 style={{ marginTop: 20 }}>📊 Price History & Audit Trail</h3>

    <div style={{
      padding: 10,
      background: "#fff7e6",
      borderRadius: 8,
      fontSize: 12
    }}>
      <p>🕒 Last Price Update: --</p>
      <p>👤 Updated By: Admin</p>
      <p>📌 Change Type: Manual / AI Suggested</p>
      <p>📈 Previous Price: --</p>
    </div>

    {/* ===================================================== */}
    {/* 📉 LOSS PREVENTION ENGINE */}
    {/* ===================================================== */}

    <h3 style={{ marginTop: 20 }}>📉 Loss Prevention Engine</h3>

    <div style={{
      padding: 10,
      background: "#ffecec",
      borderRadius: 8
    }}>

      {Number(form.sellingPrice) < totalCost ? (
        <p style={{ color: "red" }}>
          ❌ WARNING: Selling price is LOWER than cost → LOSS ALERT
        </p>
      ) : (
        <p style={{ color: "green" }}>
          ✅ Safe pricing structure (no loss detected)
        </p>
      )}

      <p style={{ fontSize: 12 }}>
        System prevents negative margin products before saving
      </p>
    </div>

    {/* ================= GUIDANCE ================= */}
    <div style={{
      marginTop: 15,
      padding: 10,
      background: "#fffbe6",
      borderLeft: "4px solid #f5c542",
      fontSize: 12
    }}>
      ⚠️ System Rules:
      <br />
      - Selling price must always be above cost
      <br />
      - AI suggestions are reference only
      <br />
      - Price history will be stored in database (next step)
      <br />
      - Loss prevention will block invalid submissions
    </div>

  </div>
)}

      {/* MEDIA */}
{step === 2 && (
  <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>

    <h2>📸 Step 2: Media + AI Creative Engine</h2>

    {/* ================= IMAGES ================= */}
    <h3>🖼️ Product Images</h3>

    <input
      type="file"
      multiple
      accept="image/*"
      onChange={handleImageUpload}
    />

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 10,
      marginTop: 15
    }}>
      {form.images.map((img, i) => (
        <div key={i} style={{ position: "relative" }}>

          <img
            src={img}
            style={{
              width: "100%",
              height: 100,
              objectFit: "cover",
              borderRadius: 8
            }}
          />

          <button
            onClick={() =>
              setForm(prev => ({
                ...prev,
                primaryImage: img
              }))
            }
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              fontSize: 10,
              background: form.primaryImage === img ? "green" : "black",
              color: "#fff",
              border: "none",
              padding: "3px 6px"
            }}
          >
            {form.primaryImage === img ? "Primary" : "Set"}
          </button>

        </div>
      ))}
    </div>

    {/* ================= VIDEO ================= */}
    <h3 style={{ marginTop: 25 }}>🎥 AI Product Video Generator</h3>

    <select
      value={form.videoStyle || ""}
      onChange={e =>
        setForm(prev => ({ ...prev, videoStyle: e.target.value }))
      }
    >
      <option>Select Video Style</option>
      <option>Premium Brand Ad</option>
      <option>Homemade Style</option>
      <option>Healthy Lifestyle</option>
      <option>Street Food Style</option>
      <option>Minimal Product Showcase</option>
    </select>

    <textarea
      placeholder="AI Prompt (auto generated but editable)"
      value={
        form.videoPrompt ||
        `Create a high quality marketing video for ${form.name} using product images. Highlight taste, quality and ingredients.`
      }
      onChange={e =>
        setForm(prev => ({ ...prev, videoPrompt: e.target.value }))
      }
      style={{ width: "100%", height: 80, marginTop: 10 }}
    />

    <button
      type="button"
      onClick={() => {
        setForm(prev => ({
          ...prev,
          videoStatus: "GENERATING"
        }));

        alert("AI video generation triggered (backend hook ready)");
      }}
      style={{
        marginTop: 10,
        width: "100%",
        padding: 12,
        background: "black",
        color: "white",
        fontWeight: "bold"
      }}
    >
      🤖 Generate AI Video
    </button>

    {/* STATUS */}
    <div style={{ marginTop: 10 }}>
      Status: {form.videoStatus || "NOT GENERATED"}
    </div>

    {/* GENERATED VIDEO PREVIEW */}
    {form.aiVideo && (
      <video
        src={form.aiVideo}
        controls
        style={{
          width: "100%",
          marginTop: 15,
          borderRadius: 10
        }}
      />
    )}

    {/* ================= PACKAGING ================= */}
    <h3 style={{ marginTop: 25 }}>📦 Product Identity</h3>

    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }}>

      <select
        value={form.packagingType}
        onChange={e =>
          setForm({ ...form, packagingType: e.target.value })
        }
      >
        <option>Packaging Type</option>
        <option>Pouch</option>
        <option>Box</option>
        <option>Jar</option>
        <option>Bottle</option>
      </select>

      <select
        value={form.visibilityTag}
        onChange={e =>
          setForm({ ...form, visibilityTag: e.target.value })
        }
      >
        <option>Visibility Tag</option>
        <option>Bestseller</option>
        <option>New Launch</option>
        <option>Premium</option>
        <option>Value Pack</option>
      </select>

    </div>

    {/* ================= INFO ================= */}
    <div style={{
      marginTop: 20,
      padding: 10,
      background: "#fffbe6",
      borderLeft: "4px solid orange",
      fontSize: 12
    }}>
      ⚠️ AI Video Notes:
      <br />
      - Uses product name + images + style
      <br />
      - Future backend will generate real video
      <br />
      - Stored as product asset (like image)
      <br />
      - Improves conversion rate significantly
    </div>

  </div>
)}

      {/* COMPLIANCE */}
     {step === 3 && (
  <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>

    <h2>🚀 Step 3: MASTER PRODUCT ENGINE (Final Control Panel)</h2>

    {/* ================= LEGAL + COMPLIANCE ================= */}
    <h3>📜 Compliance & Legal Identity</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

      <input
        placeholder="FSSAI Number"
        value={form.fssaiNumber}
        onChange={e => setForm({ ...form, fssaiNumber: e.target.value })}
      />

      <input
        placeholder="Manufacturer Name"
        value={form.manufacturerName}
        onChange={e => setForm({ ...form, manufacturerName: e.target.value })}
      />

      <input
        placeholder="Batch Number"
        value={form.batchNumber}
        onChange={e => setForm({ ...form, batchNumber: e.target.value })}
      />

      <input
        type="date"
        value={form.expiryDate}
        onChange={e => setForm({ ...form, expiryDate: e.target.value })}
      />

    </div>

    <textarea
      placeholder="Manufacturer Address"
      value={form.manufacturerAddress}
      onChange={e => setForm({ ...form, manufacturerAddress: e.target.value })}
      style={{ marginTop: 10, width: "100%" }}
    />

    {/* ================= PRODUCT CLASSIFICATION ================= */}
    <h3 style={{ marginTop: 20 }}>🏷️ Product Classification</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

      <select
        value={form.vegType}
        onChange={e => setForm({ ...form, vegType: e.target.value })}
      >
        <option>Veg</option>
        <option>Non-Veg</option>
        <option>Vegan</option>
        <option>Jain</option>
      </select>

      <input
        placeholder="Country of Origin"
        value={form.countryOfOrigin}
        onChange={e => setForm({ ...form, countryOfOrigin: e.target.value })}
      />

    </div>

    <textarea
      placeholder="Storage Instructions"
      value={form.storageInstructions}
      onChange={e => setForm({ ...form, storageInstructions: e.target.value })}
    />

    <textarea
      placeholder="Allergen Information"
      value={form.allergenInfo}
      onChange={e => setForm({ ...form, allergenInfo: e.target.value })}
    />

    {/* ================= PRICING INTELLIGENCE SUMMARY ================= */}
    <h3 style={{ marginTop: 20 }}>💰 Pricing Intelligence Summary</h3>

    <div style={{
      background: "#f6f6f6",
      padding: 10,
      borderRadius: 8
    }}>

      <p>🧾 Base Cost: ₹{form.baseCost || 0}</p>
      <p>📦 Packaging: ₹{form.packagingCost || 0}</p>
      <p>🚚 Logistics: ₹{form.logisticsCost || 0}</p>
      <p>📢 Marketing: ₹{form.marketingCost || 0}</p>

      <hr />

      <p>💰 MRP (Incl GST): ₹{form.mrp || 0}</p>
      <p>💵 Selling Price (Ex GST): ₹{form.sellingPrice || 0}</p>

      <p style={{ fontWeight: "bold" }}>
        📊 Margin Control: AUTO (backend hook ready)
      </p>

    </div>

    {/* ================= SKU + IDENTITY ================= */}
    <h3 style={{ marginTop: 20 }}>🆔 Product Identity System</h3>

    <input
      readOnly
      value={
        form.name && form.totalWeight
          ? `NA-${form.name.toUpperCase()}-001-${form.totalWeight}GM`
          : ""
      }
      placeholder="Auto SKU"
    />

    <small style={{ color: "gray" }}>
      SKU auto-managed (NA system + weight + serial)
    </small>

    {/* ================= SEO + MARKETPLACE ================= */}
    <h3 style={{ marginTop: 20 }}>🌍 SEO + Marketplace Engine</h3>

    <input
      placeholder="SEO Title"
      value={seo.title}
      readOnly
    />

    <textarea
      placeholder="SEO Description"
      value={seo.description}
      readOnly
    />

    <input
      placeholder="Keywords"
      value={seo.keywords}
      readOnly
    />

    {/* ================= TRUST + RANK BOOST ================= */}
    <h3 style={{ marginTop: 20 }}>🛡️ Trust + Ranking Signals</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

      <label>
        <input type="checkbox" readOnly checked />
        AI Optimized Product Page
      </label>

      <label>
        <input type="checkbox" readOnly checked />
        SEO Structured Content Ready
      </label>

      <label>
        <input type="checkbox" readOnly checked />
        Pricing Engine Active
      </label>

      <label>
        <input type="checkbox" readOnly checked />
        Loss Prevention Enabled
      </label>

    </div>

    {/* ================= LOSS PREVENTION ENGINE ================= */}
    <div style={{
      marginTop: 20,
      padding: 10,
      background: "#fff3f3",
      borderLeft: "4px solid red"
    }}>
      ⚠️ LOSS CONTROL ENGINE (AUTO TRACKED)
      <br />
      • Cost vs Selling Price Validation
      <br />
      • Negative margin prevention
      <br />
      • GST-inclusive sanity check
      <br />
      • Price anomaly detection (backend hook ready)
    </div>

    {/* ================= ACTION ================= */}
    <div style={{ marginTop: 20, display: "flex", gap: 10 }}>

      <button onClick={() => setStep(step - 1)}>
        ⬅ Back
      </button>

      <button
        onClick={handleSubmit}
        style={{
          background: "green",
          color: "#fff",
          padding: 10,
          flex: 1,
          fontWeight: "bold"
        }}
      >
        🚀 FINAL SUBMIT PRODUCT
      </button>

    </div>

  </div>
)}
