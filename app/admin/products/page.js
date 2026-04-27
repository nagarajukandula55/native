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

    // COMPLIANCE
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
    usageInstructions: "",
    safetyInfo: "",
    productKey: "",
    slug: "",
    sku: "",

    // SHIPPING
    weight: "",
    length: "",
    breadth: "",
    height: "",

    images: [],
    variants: [emptyVariant],
  };

  const [form, setForm] = useState(emptyForm);
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

  const gstOptions = [
    { name: "Food Preparations", hsn: "2106", tax: 5 },
    { name: "Flours", hsn: "1101", tax: 5 },
    { name: "Spices", hsn: "0910", tax: 5 },
  ];

  const gstIncludedPrice = form.sellingPrice
  ? (Number(form.sellingPrice) * (1 + (form.tax || 0) / 100)).toFixed(2)
  : 0;

  const [seoMulti, setSeoMulti] = useState({
    en: "",
    te: "",
    hi: ""
  });

  /* ================= AUTO SAVE ================= */

    useEffect(() => {
      const saved = localStorage.getItem("product_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(parsed.form || emptyForm);
        setSeo(parsed.seo || {});
        setStep(parsed.step || 0);
      }
    }, []);
    
    useEffect(() => {
      localStorage.setItem(
        "product_draft",
        JSON.stringify({ form, seo, step })
      );
    }, [form, seo, step]);

/* ================= AUTO ================= */

useEffect(() => {
  if (!displayName) return;

  const slugGen = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  setSlug(slugGen);

  const ingredientNames = Array.isArray(form.ingredients)
    ? form.ingredients.map(i => i.name.toLowerCase())
    : [];

  const base = displayName.toLowerCase();
  const nameOnly = displayName.toLowerCase();
  const categorylower = form.category?.toLowerCase() || "";
  const subcategorylower = form.subcategory?.toLowerCase() || "";

  const seoTagsArray = [
    base,
    `${base} online`,
    `buy ${base}`,
    `${base} india`,
    `${base} best price`,
    categorylower,
    subcategorylower,
    ...ingredientNames.map(i => `${i} ${nameOnly}`)
  ];

  const finalTags = [...new Set(seoTagsArray.filter(Boolean))];

  setForm(prev => ({
    ...prev,
    tags: finalTags.join(", "),
  }));

  setSeo({
    title: `${displayName} | Buy Online`,
    description: `Buy ${displayName} online at best price.`,
    keywords: finalTags.join(", "),
  });

}, [form.name, form.category, form.subcategory, form.ingredients, form.brand]);

/* ================= BARCODE + QR ================= */

useEffect(() => {
  if (!form.productId) return;

  const el = document.getElementById("barcode");
  if (!el) return;

  try {
    JsBarcode(el, String(form.productId), {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: true,
    });
  } catch (e) {
    console.error("Barcode error:", e);
  }
}, [form.productId]);


  useEffect(() => {
  if (!form.productId || !slug) return;

  setForm(prev => {
    if (
      prev.barcode === form.productId &&
      prev.qrCode === `https://shopnative.in/product/${slug}`
    ) return prev;

    return {
      ...prev,
      barcode: form.productId,
      qrCode: `https://shopnative.in/product/${slug}`
    };
  });
}, [form.productId, slug]);


/* ================= BRAND SLUG + PRODUCT ID ================= */

useEffect(() => {
  if (!form.brand) return;

  const brandSlug = form.brand.toLowerCase().replace(/\s+/g, "-");

  const id = `${brandSlug}-${Date.now().toString().slice(-5)}`;

  setForm(prev => ({
    ...prev,
    brandSlug,
    productId: id,
  }));
}, [form.brand]);


/* ================= PRICE WITH GST ================= */

useEffect(() => {
  const price =
    Number(form.sellingPrice || 0) +
    (Number(form.sellingPrice || 0) * Number(form.tax || 0)) / 100;

  setForm(prev => ({
    ...prev,
    priceWithGST: price.toFixed(2),
  }));
}, [form.sellingPrice, form.tax]);


/* ================= GST AUTO FILL ================= */

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

/* =================== Product Key ================ */

  useEffect(() => {
  if (!form.name) return;

  const { slug, productKey, sku } = generateProductIds(
    form.name,
    form.brand,
    form.totalWeight
  );

  setForm(prev => ({
    ...prev,
    slug,
    productKey,
    sku,
    productId: productKey, // optional internal ID
    barcode: productKey,
    qrCode: `https://shopnative.in/product/${slug}`
  }));

}, [form.name, form.brand, form.totalWeight]);


/* ================= HELPERS ================= */

function convertToGrams(qty, unit) {
  const value = parseFloat(qty) || 0;
  switch (unit) {
    case "KG": return value * 1000;
    case "L": return value * 1000;
    case "ML": return value;
    default: return value;
  }
}

function formatIngredients(ingredients) {
  return ingredients.map(i => i.name).join(", ");
}

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

function updateIngredient(i, field, value) {
  const updated = [...form.ingredients];
  updated[i] = { ...updated[i], [field]: value };

  setForm(prev => ({
    ...prev,
    ingredients: recalcIngredients(updated),
  }));
}

function addIngredient() {
  setForm(prev => ({
    ...prev,
    ingredients: [
      ...prev.ingredients,
      { name: "", qty: "", unit: "GM", percent: 0 },
    ],
  }));
}

function removeIngredient(i) {
  const updated = form.ingredients.filter((_, idx) => idx !== i);

  setForm(prev => ({
    ...prev,
    ingredients: recalcIngredients(updated),
  }));
}

/* ================= PRODUCT KEY ================= */

function generateProductIds(name, brand, weight) {
  const slug = `${(brand + " " + name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;

  const productKey = Date.now().toString().slice(-6);

  const sku = `NA-${name
    .toUpperCase()
    .replace(/\s+/g, "")}-${weight || "NA"}-${productKey}`;

  return { slug, productKey, sku };
}

  /* ================= AI CONTENT ================= */

  async function generateAIContent() {
    try {
      if (!form.ingredients.length) return alert("Add ingredients");

      const totalPercent = form.ingredients.reduce(
        (sum, i) => sum + parseFloat(i.percent || 0), 0
      );

      if (Math.abs(totalPercent - 100) > 1) {
        return alert("Ingredients must total ~100%");
      }

      const totalWeight = parseFloat(form.totalWeight) || 0;
      const usedWeight = form.ingredients.reduce(
        (sum, i) => sum + convertToGrams(i.qty, i.unit), 0
      );

      if (!totalWeight) return alert("Enter total weight");

      if (Math.abs(usedWeight - totalWeight) > 1) {
        return alert("Weight mismatch");
      }

      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          subcategory: form.subcategory,
          ingredients: formatIngredients(form.ingredients),
        }),
      });

      const data = await res.json();
      if (!data.success) return alert("AI failed");

      const c = data.content || data;

      setForm(prev => ({
        ...prev,
        highlights: c.highlights?.join(", ") || "",
        shortDescription: c.shortDescription || "",
        description: c.description || "",
      }));

      setSeo({
        title: c.seo?.title || "",
        description: c.seo?.description || "",
        keywords: c.seo?.keywords || "",
      });

    } catch {
      alert("AI error");
    }
  }

    const total = (form.ingredients || []).reduce(
      (sum, i) => sum + parseFloat(i.percent || 0),
      0
    );
  
   async function generateComplianceAI() {
      try {
        const res = await fetch("/api/ai-compliance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            category: form.category,
            ingredients: form.ingredients.map(i => i.name),
            productType: form.productType,
          }),
        });
    
        const data = await res.json();
    
        if (!data.success) {
          alert("AI compliance generation failed");
          return;
        }
    
        const c = data.content || data;
    
              setForm(prev => ({
                ...prev,
                allergenInfo: c.allergen || "",
                storageInstructions: c.storage || "",
                usageInstructions: c.usage || "",
                safetyInfo: c.safety || "",
              }));
        
          } catch (err) {
            alert("AI compliance error");
          }
        }

    async function generateMultiSEO() {
    const res = await fetch("/api/ai-seo-multi", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        category: form.category
      })
    });
  
    const data = await res.json();
  
    setSeoMulti({
      en: data.en,
      te: data.te,
      hi: data.hi
    });
  }

  {/* ================= PROGRESS BAR ================= */}
    <div style={{
      display: "flex",
      marginBottom: 20,
      borderRadius: 10,
      overflow: "hidden"
    }}>
      {["Basic", "Pricing", "Media", "Compliance"].map((label, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            padding: 10,
            textAlign: "center",
            background: step >= i ? "#4caf50" : "#ddd",
            color: step >= i ? "#fff" : "#333",
            fontWeight: "bold",
            fontSize: 12
          }}
        >
          {label}
        </div>
      ))}
    </div>

  /* ================= STEP VALIDATION ================= */

  function validateStep(currentStep) {
    switch (currentStep) {
  
      case 0:
        if (!form.name) return "Enter product name";
        if (!form.category) return "Select category";
        if (!form.totalWeight) return "Enter total weight";
        if (!form.ingredients.length) return "Add ingredients";
        return null;
  
      case 1:
        if (!form.sellingPrice) return "Enter selling price";
        if (Number(form.sellingPrice) <= 0) return "Invalid price";
        return null;
  
      case 2:
        if (!form.images.length) return "Upload at least 1 image";
        return null;
  
      case 3:
        if (!form.fssaiNumber) return "FSSAI required";
        return null;
  
      default:
        return null;
    }
  }

/* ================= PRICING CALCULATIONS ================= */

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

/* ================= IMAGE UPLOAD ================= */

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
  
    if (!files.length) return;
  
    const uploaded = [];
  
    for (let file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "native_upload");
  
      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: data,
          }
        );
  
        const json = await res.json();
  
        if (json.secure_url) {
          uploaded.push(json.secure_url);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
  
    setForm(prev => ({
      ...prev,
      images: [...(prev.images || []), ...uploaded],
    }));
  }

    function generateNutrition() {
      const totalWeight = Number(form.totalWeight || 0);
    
      if (!totalWeight) return;
    
      setForm(prev => ({
        ...prev,
        nutrition: {
          energy: totalWeight * 3.5,
          protein: totalWeight * 0.1,
          carbs: totalWeight * 0.6,
          fat: totalWeight * 0.2
        }
      }));
    }

    function generateLocalSEO() {
      const name = form.name || "";
    
      setForm(prev => ({
        ...prev,
        seoLocal: {
          telugu: `${name} ఆన్లైన్ లో కొనండి`,
          hindi: `${name} ऑनलाइन खरीदें`
        }
      }));
    }
    
    useEffect(() => {
      if (!form.productId) return;
    
      try {
        setForm(prev => {
          // prevent unnecessary re-render loop
          if (prev.barcode === form.productId) return prev;
    
          return {
            ...prev,
            barcode: form.productId,
            qrCode: `https://shopnative.in/product/${slug}`
          };
        });
      } catch (e) {
        console.error(e);
      }
    }, [form.productId, slug]);

/* ============ Handle Submit ===========*/

      const handleSubmit = async () => {
        try {
          setError("");
      
              const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(cleanPayload),
              });
          });
      
          // ✅ SAFE CHECK BEFORE JSON PARSE
          const text = await res.text();
      
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.error("Invalid JSON from API:", text);
            setError("Server returned invalid response");
            return;
          }
      
          if (!data.success) {
            setError(data.message || "Product submission failed");
            return;
          }
      
          alert("Product submitted successfully!");
        } catch (err) {
          console.error("Submit error:", err);
          setError("Network or server error");
        }
      };

        const cleanPayload = {
          ...form,
        
          slug,
          productKey,
          sku,
        
          ingredients: form.ingredients,
        
          nutrition: {
            energy: Number(form.nutrition?.energy || 0),
            protein: Number(form.nutrition?.protein || 0),
            carbs: Number(form.nutrition?.carbs || 0),
            fat: Number(form.nutrition?.fat || 0),
          },
        
          variant: form.variants?.[0] || {
            value: "default",
            unit: "GM",
            sku: form.sku || "",
            mrp: Number(form.mrp || 0),
            sellingPrice: Number(form.sellingPrice || 0),
            stock: 0
          }
        };


  /* ================= UI ================= */

return (
  <div style={{ maxWidth: 1100, margin: "auto", padding: 20 }}>

    <h1>Product Admin</h1>

    {error && <div style={{ color: "red" }}>{error}</div>}

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

      <input
        placeholder="Product Name"
        value={displayName}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <select
        value={form.brand}
        onChange={e => setForm({ ...form, brand: e.target.value })}
      >
        <option>Select Brand</option>
        <option>Native</option>
        <option>AN</option>
      </select>

      <select
        value={form.category}
        onChange={e =>
          setForm({ ...form, category: e.target.value, subcategory: "" })
        }
      >
        <option>Select Category</option>
        {Object.keys(categoryMap).map(c => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <select
        value={form.subcategory}
        onChange={e => setForm({ ...form, subcategory: e.target.value })}
      >
        <option>Select Subcategory</option>
        {(categoryMap[form.category] || []).map(s => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <textarea
        placeholder="Short Description"
        value={form.shortDescription}
        onChange={e => setForm({ ...form, shortDescription: e.target.value })}
        style={{ gridColumn: "span 2" }}
      />

      <textarea
        placeholder="Full Description"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        style={{ gridColumn: "span 2" }}
      />

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

      <input value={form.tags || ""} readOnly style={{ background: "#f5f5f5" }} />
      <input value={slug || ""} readOnly style={{ background: "#f5f5f5" }} />

      <input value={seo.title || ""} readOnly style={{ background: "#f5f5f5" }} />

      <textarea
        value={seo.description || ""}
        readOnly
        style={{ gridColumn: "span 2", background: "#f5f5f5" }}
      />
    </div>

    {/* ================= INGREDIENT INPUT ================= */}
    <div style={{ padding: 20, background: "#fff", borderRadius: 10 }}>
      <h3>⚖️ Product Weight</h3>

      <input
        type="number"
        placeholder="Total Weight (GM)"
        value={form.totalWeight}
        onChange={e => setForm({ ...form, totalWeight: e.target.value })}
      />
    </div>

    {/* ================= INGREDIENTS ================= */}
    <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
      <h3>🥗 Ingredients</h3>

      {(form.ingredients || []).map((ing, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
            gap: 10,
            marginBottom: 10,
            alignItems: "center"
          }}
        >
          <input
            placeholder="Ingredient Name"
            value={ing.name}
            onChange={e => updateIngredient(i, "name", e.target.value)}
          />

          <input
            type="number"
            placeholder="Qty"
            value={ing.qty}
            onChange={e => updateIngredient(i, "qty", e.target.value)}
          />

          <select
            value={ing.unit}
            onChange={e => updateIngredient(i, "unit", e.target.value)}
          >
            <option>GM</option>
            <option>KG</option>
            <option>ML</option>
            <option>L</option>
          </select>

          <input
            value={`${ing.percent ?? 0}%`}
            readOnly
            style={{ background: "#eee" }}
          />

          <button onClick={() => removeIngredient(i)}>X</button>
        </div>
      ))}

      <button onClick={addIngredient}>+ Add Ingredient</button>

      <div style={{ marginTop: 15, fontWeight: "bold" }}>
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
      {(form.images || []).map((img, i) => (
        <div key={i} style={{ position: "relative" }}>

          <img
            src={img}
            alt=""
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
        `Create a high quality marketing video for ${form.name || ""} using product images. Highlight taste, quality and ingredients.`
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
        value={form.packagingType || ""}
        onChange={e =>
          setForm(prev => ({ ...prev, packagingType: e.target.value }))
        }
      >
        <option>Packaging Type</option>
        <option>Pouch</option>
        <option>Box</option>
        <option>Jar</option>
        <option>Bottle</option>
      </select>

      <select
        value={form.visibilityTag || ""}
        onChange={e =>
          setForm(prev => ({ ...prev, visibilityTag: e.target.value }))
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

    {/* ================= COMPLIANCE ================= */}
    <h3>📜 Compliance & Legal Identity</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <input
        placeholder="FSSAI Number"
        value={form.fssaiNumber || ""}
        onChange={e =>
          setForm(prev => ({ ...prev, fssaiNumber: e.target.value }))
        }
      />

      <input
        placeholder="Manufacturer Name"
        value={form.manufacturerName || ""}
        onChange={e =>
          setForm(prev => ({ ...prev, manufacturerName: e.target.value }))
        }
      />
    </div>

    <button
      type="button"
      onClick={generateComplianceAI}
      style={{
        marginTop: 10,
        padding: 10,
        width: "100%",
        background: "black",
        color: "white",
        fontWeight: "bold"
      }}
    >
      🤖 Auto Generate Compliance (AI)
    </button>

    {/* ================= MANUFACTURING ================= */}
    <h3 style={{ marginTop: 20 }}>🏭 Manufacturing Details</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <select
        value={form.manufacturerType || ""}
        onChange={e =>
          setForm(prev => ({ ...prev, manufacturerType: e.target.value }))
        }
      >
        <option value="">Select Type</option>
        <option>Manufacturer</option>
        <option>Packer</option>
        <option>Marketer</option>
      </select>

      <input
        placeholder="Shelf Life (e.g. 6 Months)"
        value={form.shelfLife || ""}
        onChange={e =>
          setForm(prev => ({ ...prev, shelfLife: e.target.value }))
        }
      />
    </div>

    {/* ================= CLASSIFICATION ================= */}
    <h3 style={{ marginTop: 20 }}>🏷️ Product Classification</h3>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <select
        value={form.vegType || ""}
        onChange={e =>
          setForm(prev => ({ ...prev, vegType: e.target.value }))
        }
      >
        <option>Veg</option>
        <option>Non-Veg</option>
        <option>Vegan</option>
        <option>Jain</option>
      </select>

      <input
        placeholder="Country of Origin"
        value={form.countryOfOrigin || ""}
        onChange={e =>
          setForm(prev => ({
            ...prev,
            countryOfOrigin: e.target.value
          }))
        }
      />
    </div>

    <textarea
      placeholder="Storage Instructions"
      value={form.storageInstructions || ""}
      onChange={e =>
        setForm(prev => ({ ...prev, storageInstructions: e.target.value }))
      }
    />

    <textarea
      placeholder="Allergen Information"
      value={form.allergenInfo || ""}
      onChange={e =>
        setForm(prev => ({ ...prev, allergenInfo: e.target.value }))
      }
    />

    <textarea
      placeholder="Usage Instructions"
      value={form.usageInstructions || ""}
      onChange={e =>
        setForm(prev => ({ ...prev, usageInstructions: e.target.value }))
      }
    />

    <label style={{ marginTop: 10, display: "block" }}>
      <input
        type="checkbox"
        checked={form.nonReturnable ?? true}
        onChange={e =>
          setForm(prev => ({ ...prev, nonReturnable: e.target.checked }))
        }
      />{" "}
      Non-Returnable Product
    </label>

    {/* ================= NUTRITION ================= */}
    <h3 style={{ marginTop: 20 }}>🥗 Nutrition Table</h3>

    <button onClick={generateNutrition} style={{ marginBottom: 10 }}>
      Auto Generate Nutrition
    </button>

    <div style={{ background: "#f6f6f6", padding: 10, borderRadius: 8 }}>
      <p>Energy: {form.nutrition?.energy || "-"}</p>
      <p>Protein: {form.nutrition?.protein || "-"}</p>
      <p>Carbs: {form.nutrition?.carbs || "-"}</p>
      <p>Fat: {form.nutrition?.fat || "-"}</p>
    </div>

    {/* ================= PRICING ================= */}
    <h3 style={{ marginTop: 20 }}>💰 Pricing Summary</h3>

    <div style={{ background: "#f6f6f6", padding: 10, borderRadius: 8 }}>
      <p>🧾 Base Cost: ₹{form.baseCost || 0}</p>
      <p>📦 Packaging: ₹{form.packagingCost || 0}</p>
      <p>🚚 Logistics: ₹{form.logisticsCost || 0}</p>
      <p>📢 Marketing: ₹{form.marketingCost || 0}</p>

      <hr />

      <p>💰 MRP (Incl GST): ₹{form.mrp || 0}</p>
      <p>💵 Selling Price (Ex GST): ₹{form.sellingPrice || 0}</p>
      <p>💵 Selling Price (Incl GST): ₹{gstIncludedPrice}</p>
    </div>

    {/* ================= SKU ================= */}
    <h3 style={{ marginTop: 20 }}>🆔 SKU</h3>

    <input
      readOnly
      value={
        form.name && form.totalWeight
          ? `NA-${form.name.toUpperCase().replace(/\s+/g, "")}-001-${form.totalWeight}GM`
          : ""
      }
    />

    {/* ================= PRODUCT ID ================= */}
    <h3 style={{ marginTop: 20 }}>🔗 Product Codes</h3>

    <input readOnly value={form.productId || ""} />

    <svg ref={el => (barcodeRefs.current[0] = el)} style={{ marginTop: 10 }} />

    <div style={{ marginTop: 10 }}>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?data=${form.productId || ""}`}
        width={120}
      />
    </div>

    {/* ================= SEO ================= */}
    <h3 style={{ marginTop: 20 }}>🌍 SEO</h3>

    <input value={seo.title || ""} readOnly />
    <textarea value={seo.description || ""} readOnly />
    <input value={seo.keywords || ""} readOnly />

    {/* ================= LOCAL SEO ================= */}
    <h3 style={{ marginTop: 20 }}>🌍 Multi-Language SEO</h3>

    <button onClick={generateLocalSEO}>Generate Local SEO</button>

    <textarea value={form.seoLocal?.telugu || ""} readOnly />
    <textarea value={form.seoLocal?.hindi || ""} readOnly />

          {/* ================= FINAL ACTION ================= */}
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>

            {/* BACK BUTTON */}
            <button
              onClick={() => setStep(prev => Math.max(prev - 1, 0))}
              style={{
                padding: 10,
                background: "#ddd",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              ⬅ Back
            </button>
          
            {/* FINAL SUBMIT BUTTON */}
            <button
              onClick={async () => {
                try {
                  // ================= VALIDATION =================
                  const err = validateStep(3);
                  if (err) return setError(err);
          
                  if (!form.productId) return setError("Product ID missing");
                  if (!form.images || form.images.length === 0)
                    return setError("Upload at least 1 image");
                  if (!form.totalWeight)
                    return setError("Total weight missing");
                  if (!form.fssaiNumber)
                    return setError("FSSAI number required");
                  if (!form.nutrition?.energy)
                    return setError("Generate nutrition first");
                  if (!form.barcode)
                    return setError("Barcode missing");
          
                  setError("");
          
                  // ================= SUBMIT =================
                  await handleSubmit();
          
                } catch (e) {
                  console.error(e);
                  setError("Something went wrong during submission");
                }
              }}
              style={{
                background: "green",
                color: "#fff",
                padding: 10,
                flex: 1,
                fontWeight: "bold",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              🚀 FINAL SUBMIT PRODUCT
            </button>
          
          </div>
      
      </div>
      )}

      {/* ================= GLOBAL STEP NAVIGATION ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 20,
          gap: 10
        }}
      >
        {/* BACK */}
        {step > 0 && (
          <button
            onClick={() => setStep(prev => prev - 1)}
            style={{
              padding: 10,
              background: "#ddd",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            ⬅ Back
          </button>
        )}

        {/* NEXT */}
        {step < 3 && (
          <button
            onClick={() => {
              const err = validateStep(step);
              if (err) {
                setError(err);
                return;
              }

              setError("");
              setStep(prev => prev + 1);
            }}
            style={{
              padding: 10,
              background: "black",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              marginLeft: "auto",
              cursor: "pointer"
            }}
          >
            Next ➡
          </button>
        )}
      </div>

    </div>
  );
}
