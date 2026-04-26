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
    ingredients: [{ name: "", qty: "", unit: "GM", percent: 0 }],

    subcategory: "",
    highlights: "",
    productType: "Veg",
    totalWeight: "",

    baseCost: "",
    packagingCost: "",
    logisticsCost: "",
    marketingCost: "",
    hsn: "",
    tax: 0,
    mrp: "",
    sellingPrice: "",
    totalWeight: "",

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

  /* ================= AUTO ================= */

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

  const nameWords = cleanName.toLowerCase().split(" ");
  const categoryname = form.category?.toLowerCase();
  const subcategoryname = form.subcategory?.toLowerCase();

  // ✅ FIX: moved up
  const ingredientNames = Array.isArray(form.ingredients)
    ? form.ingredients.map(i => i.name.toLowerCase())
    : (form.ingredients || "").toLowerCase().split(",");

  const base = displayName.toLowerCase();
  const nameOnly = cleanName.toLowerCase();
  const categorylower = form.category?.toLowerCase() || "";
  const subcategorylower = form.subcategory?.toLowerCase() || "";

  const seoTagsArray = [
    base,
    `${base} online`,
    `buy ${base}`,
    `buy ${base} online`,
    `${base} india`,
    `${base} best price`,
    `${base} near me`,
    `best ${nameOnly}`,
    `${nameOnly} online`,
    `${nameOnly} india`,
    `healthy ${nameOnly}`,
    `instant ${nameOnly}`,
    `natural ${nameOnly}`,
    `organic ${nameOnly}`,
    categorylower,
    subcategorylower,
    ...ingredientNames.map(i => `${i.trim()} ${nameOnly}`)
  ];

  const finalTags = [...new Set(
    seoTagsArray.filter(w => w && w.length > 3)
  )].slice(0, 25);

  setForm(prev => ({
    ...prev,
    tags: finalTags.join(", "),
  }));

  setSeo({
    title: `${displayName} | Buy Online`,
    description: `Buy ${displayName} online at best price. Premium quality ${cleanName} from ${form.brand || "trusted brand"}.`,
    keywords: finalTags.join(", "),
  });

}, [form.name, form.category, form.subcategory, form.ingredients, form.brand]);
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

  <div style={{ marginTop: 10, fontWeight: "bold" }}>
      Used: {form.ingredients.reduce((sum, i) => sum + convertToGrams(i.qty, i.unit), 0)} gm / {form.totalWeight || 0} gm
    </div>

  /*  ======= Product Key Safe  ========  */
  
  useEffect(() => {
  if (form.name && !productKey) {
    setProductKey(Date.now().toString().slice(-6));
  }
}, [form.name]);
  

/* =============== AI Content ============== */

async function generateAIContent() {
  try {
    /* ✅ VALIDATION FIRST */
    if (!Array.isArray(form.ingredients) || form.ingredients.length === 0) {
      alert("Add ingredients");
      return;
    }

    const totalPercent = form.ingredients.reduce(
      (sum, i) => sum + parseFloat(i.percent || 0),
      0
    );

    if (Math.abs(totalPercent - 100) > 1) {
      alert("Ingredients must total ~100%");
      return;
    }

    const totalWeight = parseFloat(form.totalWeight) || 0;

      const usedWeight = form.ingredients.reduce((sum, i) => {
        return sum + convertToGrams(i.qty, i.unit);
      }, 0);
      
      if (!totalWeight) {
        alert("Enter total weight");
        return;
      }
      
      if (Math.abs(usedWeight - totalWeight) > 1) {
        alert(`Total ingredient weight (${usedWeight}g) must match product weight (${totalWeight}g)`);
        return;
      }

    /* ✅ FORMAT INGREDIENTS */
    const cleanedIngredients = formatIngredients(form.ingredients);

    const res = await fetch("/api/ai-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        subcategory: form.subcategory,
        ingredients: cleanedIngredients, // ✅ reuse
      }),
    });

    const data = await res.json();

    console.log("AI RESPONSE:", data); // 🔥 Debug

    if (!data.success) {
      alert("AI generation failed");
      return;
    }

    // ✅ FIX: define once only
    const c = data.content || data;

    /* ✅ UPDATE FORM */
    setForm(prev => ({
      ...prev,
      highlights: Array.isArray(c.highlights)
        ? c.highlights.join(", ")
        : c.highlights || prev.highlights || "",
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

    function formatIngredientsString(raw) {
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

  /* ================= TAG GENERATOR ================= */

    function generateSEOTags() {
      if (!form.name) return [];
    
      const name = form.name.toLowerCase();
      const brand = form.brand?.toLowerCase() || "";
      const categoryLower = form.category?.toLowerCase() || "";
      const subcategoryLower = form.subcategory?.toLowerCase() || "";
    
      const ingredientNames = Array.isArray(form.ingredients)
        ? form.ingredients.map(i => i.name.toLowerCase())
        : (form.ingredients || "").toLowerCase().split(",");
    
      const base = `${brand} ${name}`.trim();
    
      const tags = [
        base,
        `${base} online`,
        `buy ${base}`,
        `buy ${base} online`,
        `${base} india`,
        `${base} best price`,
        `${base} near me`,
        `best ${name}`,
        `${name} online`,
        `${name} india`,
        `${categoryLower}`,
        `${subcategoryLower}`,
        `healthy ${name}`,
        `instant ${name}`,
        `homemade ${name}`,
        `natural ${name}`,
        `organic ${name}`,
        ...ingredientNames.map(i => `${i.trim()} ${name}`),
      ];
    
      return [...new Set(tags.filter(Boolean))].slice(0, 25);
    }

  /* ================= Format Ingredients ================= */
  
    function formatIngredients(ingredients) {
      if (!Array.isArray(ingredients)) return "";
    
      return ingredients.map(i => i.name).join(", ");
    }

    /* ================= Calculate Ingredients ================= */
  
    function calculateIngredientPercentages(ingredients) {
      const total = ingredients.reduce((sum, i) => sum + Number(i.qty || 0), 0);
    
      return ingredients.map(i => ({
        ...i,
        percent: total ? ((i.qty / total) * 100).toFixed(1) : 0
      }));
    }

  /* ================= INGREDIENTS ================= */

    // convert everything to grams
    function convertToGrams(qty, unit) {
      const value = parseFloat(qty) || 0;
    
      switch (unit) {
        case "KG":
          return value * 1000;
        case "L":
          return value * 1000;
        case "ML":
          return value;
        default:
          return value; // GM
      }
    }
    
    // recalculate percentages
    function recalcIngredients(updated) {
      const totalWeight = parseFloat(form.totalWeight) || 0;
    
      return updated.map(i => {
        const grams = convertToGrams(i.qty, i.unit);
    
        return {
          ...i,
          percent: totalWeight
            ? ((grams / totalWeight) * 100).toFixed(2)
            : 0,
        };
      });
    }
    
    // update ingredient
    function updateIngredient(i, field, value) {
      const updated = [...form.ingredients];
    
      updated[i] = {
        ...updated[i],
        [field]: value,
      };
    
      const recalculated = recalcIngredients(updated);
    
      setForm(prev => ({
        ...prev,
        ingredients: recalculated,
      }));
    }
    
    // add ingredient
    function addIngredient() {
      setForm(prev => ({
        ...prev,
        ingredients: [
          ...prev.ingredients,
          { name: "", qty: "", unit: "GM", percent: 0 }
        ],
      }));
    }
    
    // remove ingredient
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

 
  /* ================= SAVE ================= */

  async function handleSubmit() {
    const tags = generateSEOTags();
    const err = validate();
    if (err) return setError(err);

    for (let v of form.variants) {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          displayName,
          brand: form.brand,
          tags,
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

  /* ================= 🔥 PUT CALC LOGIC HERE ================= */
    const totalCost =
      Number(form.baseCost || 0) +
      Number(form.packagingCost || 0) +
      Number(form.logisticsCost || 0) +
      Number(form.marketingCost || 0);
  
    const gstAmount =
      (Number(form.sellingPrice || 0) * Number(form.tax || 0)) / 100;
  
    const finalPrice =
      Number(form.sellingPrice || 0) + gstAmount;
  
    const profit =
      Number(form.sellingPrice || 0) - totalCost;
  
    const margin =
      form.sellingPrice
        ? (profit / form.sellingPrice) * 100
        : 0;

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
        
            <h2>📸 Step 2: Media & Product Identity</h2>
        
            {/* ================= IMAGE UPLOAD ================= */}
            <h3>🖼️ Product Images</h3>
        
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />
        
            {/* PREVIEW GRID */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginTop: 15
            }}>
              {form.images.map((img, i) => (
                <div key={i} style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  borderRadius: 8,
                  position: "relative"
                }}>
        
                  <img
                    src={img}
                    style={{ width: "100%", height: 100, objectFit: "cover" }}
                  />
        
                  {/* PRIMARY SELECT */}
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
                      padding: "3px 6px",
                      cursor: "pointer"
                    }}
                  >
                    {form.primaryImage === img ? "Primary" : "Set Primary"}
                  </button>
        
                </div>
              ))}
            </div>
        
            {/* ================= VIDEO UPLOAD ================= */}
            <h3 style={{ marginTop: 25 }}>🎥 Product Video</h3>
        
            <input
              type="file"
              accept="video/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
        
                const videoURL = URL.createObjectURL(file);
        
                setForm(prev => ({
                  ...prev,
                  video: videoURL
                }));
              }}
            />
        
            {/* VIDEO PREVIEW */}
            {form.video && (
              <video
                src={form.video}
                controls
                style={{
                  width: "100%",
                  marginTop: 10,
                  borderRadius: 10
                }}
              />
            )}
        
            {/* ================= AI VIDEO GENERATION ================= */}
            <h3 style={{ marginTop: 25 }}>🤖 AI Video Generator</h3>
        
            <div style={{
              padding: 15,
              background: "#f0f7ff",
              borderRadius: 10
            }}>
        
              <p>
                Generate product marketing video using images automatically
              </p>
        
              <button
                onClick={() => alert("AI Video generation will be connected later")}
                style={{
                  padding: 10,
                  background: "black",
                  color: "white",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                ⚡ Generate AI Video (Beta)
              </button>
            </div>
        
            {/* ================= PACKAGING VISUAL INFO ================= */}
            <h3 style={{ marginTop: 25 }}>📦 Packaging Identity</h3>
        
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
                <option>Bottle</option>
                <option>Jar</option>
                <option>Sachet</option>
              </select>
        
              <select
                value={form.visibilityTag}
                onChange={e =>
                  setForm({ ...form, visibilityTag: e.target.value })
                }
              >
                <option>Visibility Badge</option>
                <option>New Launch</option>
                <option>Bestseller</option>
                <option>Premium</option>
                <option>Value Pack</option>
              </select>
        
            </div>
        
            {/* ================= SEO IMAGE INFO ================= */}
            <h3 style={{ marginTop: 25 }}>🔎 Image SEO Metadata (Auto-ready)</h3>
        
            <textarea
              placeholder="Auto-generated alt text (future AI hook)"
              value={
                form.images.map(img => `product image ${form.name}`).join(", ")
              }
              readOnly
              style={{ width: "100%", height: 80 }}
            />
        
            {/* ================= INFO BOX ================= */}
            <div style={{
              marginTop: 20,
              padding: 10,
              background: "#fffbe6",
              borderLeft: "4px solid orange",
              fontSize: 12
            }}>
              ⚠️ Rules:
              <br />
              - First selected image becomes primary display image
              <br />
              - Video improves conversion rate by 30–60%
              <br />
              - AI video generation will use images + description later
              <br />
              - Packaging + visibility affects ranking in search
            </div>
        
          </div>
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
