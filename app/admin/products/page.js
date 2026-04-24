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

  // 🔥 NEW FIELDS (COMPLIANCE)
  manufacturerName: "",
  manufacturerAddress: "",
  fssaiLicense: "",
  countryOfOrigin: "India",
  packedDate: "",
  expiryDate: "",
  storageInstructions: "",
  allergenInfo: "",

  // 🔥 NUTRITION SYSTEM
  nutritionInputs: [
    { name: "", ratio: "" }
  ],

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
];

const websiteCategories = ["Instant Mixes","Spices & Masalas"];

/* ================= AUTO ================= */

useEffect(() => {
  if (!form.name) return;

  const key = form.name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  setProductKey(key);

  const slugGen = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  setSlug(slugGen);

}, [form.name]);

/* ================= VARIANTS ================= */

function updateVariant(i, field, value) {
  const updated = [...form.variants];
  updated[i][field] = value;

  if (updated[i].value && productKey) {
    updated[i].sku = `NA-${productKey}-${i + 1}`;
  }

  setForm(prev => ({ ...prev, variants: updated }));
}

function addVariant() {
  setForm(prev => ({
    ...prev,
    variants: [...prev.variants, emptyVariant],
  }));
}

/* ================= NUTRITION ================= */

function updateNutrition(i, field, value) {
  const updated = [...form.nutritionInputs];
  updated[i][field] = value;
  setForm(prev => ({ ...prev, nutritionInputs: updated }));
}

function addNutrition() {
  setForm(prev => ({
    ...prev,
    nutritionInputs: [...prev.nutritionInputs, { name: "", ratio: "" }],
  }));
}

// 🔥 SIMPLE CALCULATION (dummy logic)
function calculateNutrition() {
  return form.nutritionInputs.map(n => ({
    ingredient: n.name,
    calories: Number(n.ratio) * 4,
    protein: Number(n.ratio) * 0.2,
  }));
}

// 🔥 DOWNLOAD CSV
function downloadNutrition() {
  const data = calculateNutrition();
  let csv = "Ingredient,Calories,Protein\n";

  data.forEach(d => {
    csv += `${d.ingredient},${d.calories},${d.protein}\n`;
  });

  const blob = new Blob([csv]);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "nutrition.csv";
  a.click();
}

/* ================= IMAGE ================= */

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
    if (json?.secure_url) uploaded.push(json.secure_url);
  }

  setForm(prev => ({
    ...prev,
    images: [...prev.images, ...uploaded],
  }));
}

/* ================= SAVE ================= */

async function handleSubmit() {

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
        status: "review",
      }),
    });
  }

  alert("Saved");
}

/* ================= UI ================= */

return (
<div style={{ padding: 20 }}>

<h2>Product Panel</h2>

{/* BASIC */}
{step === 0 && (
<div>

<input placeholder="Product Name (e.g. Dosa Mix)"
value={form.name}
onChange={e=>setForm({...form,name:e.target.value})}/>

<input placeholder="Manufacturer Name"
value={form.manufacturerName}
onChange={e=>setForm({...form,manufacturerName:e.target.value})}/>

<input placeholder="FSSAI License"
value={form.fssaiLicense}
onChange={e=>setForm({...form,fssaiLicense:e.target.value})}/>

<input placeholder="Country of Origin"
value={form.countryOfOrigin}
onChange={e=>setForm({...form,countryOfOrigin:e.target.value})}/>

</div>
)}

{/* VARIANTS */}
{step === 1 && (
<div>
{form.variants.map((v,i)=>(
<div key={i}>
<input placeholder="Weight"
onChange={e=>updateVariant(i,"value",e.target.value)}/>
<input placeholder="MRP"
onChange={e=>updateVariant(i,"mrp",e.target.value)}/>
<input placeholder="Price"
onChange={e=>updateVariant(i,"sellingPrice",e.target.value)}/>
</div>
))}
<button onClick={addVariant}>Add Variant</button>
</div>
)}

{/* MEDIA */}
{step === 2 && (
<input type="file" multiple onChange={handleImageUpload}/>
)}

{/* NUTRITION */}
{step === 3 && (
<div>

<h4>Nutrition Builder</h4>

{form.nutritionInputs.map((n,i)=>(
<div key={i}>
<input placeholder="Ingredient"
onChange={e=>updateNutrition(i,"name",e.target.value)}/>
<input placeholder="Ratio (%)"
onChange={e=>updateNutrition(i,"ratio",e.target.value)}/>
</div>
))}

<button onClick={addNutrition}>Add Ingredient</button>

<button onClick={downloadNutrition}>
Download Nutrition CSV
</button>

</div>
)}

{/* ================= PROGRESS BAR ================= */}

<div style={{ marginBottom: 20 }}>

  {/* Progress Line */}
  <div style={{
    height: 6,
    background: "#eee",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10
  }}>
    <div style={{
      width: `${(step / 3) * 100}%`,
      background: "#4CAF50",
      height: "100%",
      transition: "0.3s"
    }} />
  </div>

  {/* Steps */}
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}>

    {["Basic", "Variants", "Media", "SEO"].map((label, index) => (
      <div
        key={index}
        onClick={() => setStep(index)}
        style={{
          cursor: "pointer",
          textAlign: "center",
          flex: 1
        }}
      >

        {/* Circle */}
        <div style={{
          margin: "auto",
          width: 32,
          height: 32,
          borderRadius: "50%",
          background:
            step === index
              ? "#4CAF50"
              : step > index
              ? "#2e7d32"
              : "#ccc",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold"
        }}>
          {step > index ? "✓" : index + 1}
        </div>

        {/* Label */}
        <div style={{
          fontSize: 12,
          marginTop: 5,
          color: step === index ? "#4CAF50" : "#777"
        }}>
          {label}
        </div>

      </div>
    ))}

  </div>

</div>

</div>
);
}
