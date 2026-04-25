"use client";

import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

/* ================= CORE ================= */

export default function ProductUpload() {

  const emptyVariant = {
    value: "",
    unit: "GM",
    sku: "",
    mrp: "",
    sellingPrice: "",
  };

  const emptyNutrition = {
    name: "",
    amount: "",
    unit: "g",
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
    fssaiLicense: "",
    manufacturer: "",
    netQuantity: "",
    countryOfOrigin: "India",
    images: [],
    nutrition: [emptyNutrition],
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

  /* ================= GST MASTER ================= */

  const gstOptions = [
    { name: "Food Preparations", hsn: "2106", tax: 5, desc: "Dosa mix" },
    { name: "Flours", hsn: "1101", tax: 5, desc: "Flour products" },
    { name: "Spices", hsn: "0910", tax: 5 },
    { name: "Oils", hsn: "1515", tax: 5 },
  ];

  const websiteCategories = [
    "Instant Mixes",
    "Spices",
    "Oils",
    "Flours",
  ];

  /* ================= AUTO GENERATORS ================= */

  useEffect(() => {
    if (!form.name) return;

    const clean = form.name.replace(/native/gi, "").trim();
    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setProductKey(key);

    const slugGen = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setSlug(slugGen);

    setSeo({
      title: `${form.name} | Buy Online`,
      description: `Buy ${form.name} at best price`,
      keywords: `${form.name}, buy online`,
    });

  }, [form.name]);

  useEffect(() => {
    const g = gstOptions.find(x => x.name === form.gstCategory);
    if (g) {
      setForm(prev => ({
        ...prev,
        hsn: g.hsn,
        tax: g.tax,
        gstDescription: g.desc,
      }));
    }
  }, [form.gstCategory]);

  /* ================= VARIANTS ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];
    updated[i][field] = value;

    if (updated[i].value && productKey) {
      updated[i].sku = `NA-${productKey}-${String(i + 1).padStart(3, "0")}-${updated[i].value}${updated[i].unit}`;
    }

    setForm(prev => ({ ...prev, variants: updated }));
  }

  function addVariant() {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { ...emptyVariant }],
    }));
  }

  /* ================= NUTRITION ================= */

  function updateNutrition(i, field, value) {
    const updated = [...form.nutrition];
    updated[i][field] = value;
    setForm(prev => ({ ...prev, nutrition: updated }));
  }

  function addNutrition() {
    setForm(prev => ({
      ...prev,
      nutrition: [...prev.nutrition, { ...emptyNutrition }],
    }));
  }

  function downloadNutrition() {
    let csv = "Nutrient,Amount\n";
    form.nutrition.forEach(n => {
      csv += `${n.name},${n.amount}${n.unit}\n`;
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
    if (!form.images.length) return "Upload image";

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
    setForm(emptyForm);
    setStep(0);
  }

  /* ================= PROGRESS ================= */

  const progress = ((step + 1) / 4) * 100;

  /* ================= UI ================= */

  return (
    <div style={{ maxWidth: 1100, margin: "auto", padding: 20 }}>

      <h1>🛒 Product Admin Panel</h1>

      {/* PROGRESS BAR */}
      <div style={{ height: 8, background: "#eee", marginBottom: 10 }}>
        <div style={{
          width: `${progress}%`,
          background: "#4caf50",
          height: "100%"
        }} />
      </div>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* NAV */}
      <div>
        <button onClick={()=>setStep(0)}>Basic</button>
        <button onClick={()=>setStep(1)}>Variants</button>
        <button onClick={()=>setStep(2)}>Nutrition</button>
        <button onClick={()=>setStep(3)}>Media</button>
      </div>

      {/* BASIC */}
      {step === 0 && (
        <div>
          <input placeholder="Product Name (SEO auto generated)"
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}/>

          <input placeholder="FSSAI License"
            onChange={e=>setForm({...form,fssaiLicense:e.target.value})}/>

          <textarea placeholder="Ingredients (important for compliance)"
            onChange={e=>setForm({...form,ingredients:e.target.value})}/>
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
              <input placeholder="Selling Price"
                onChange={e=>updateVariant(i,"sellingPrice",e.target.value)}/>
              <input value={v.sku} readOnly/>
              <svg ref={el=>barcodeRefs.current[i]=el}/>
            </div>
          ))}
          <button onClick={addVariant}>+ Add Variant</button>
        </div>
      )}

      {/* NUTRITION */}
      {step === 2 && (
        <div>
          {form.nutrition.map((n,i)=>(
            <div key={i}>
              <input placeholder="Nutrient"
                onChange={e=>updateNutrition(i,"name",e.target.value)}/>
              <input placeholder="Amount"
                onChange={e=>updateNutrition(i,"amount",e.target.value)}/>
            </div>
          ))}
          <button onClick={addNutrition}>+ Add Nutrient</button>
          <button onClick={downloadNutrition}>⬇ Download</button>
        </div>
      )}

      {/* MEDIA */}
      {step === 3 && (
        <div>
          <input type="file" multiple onChange={handleImageUpload}/>
        </div>
      )}

      {/* ACTION */}
      <div style={{ marginTop: 20 }}>
        {step > 0 && <button onClick={()=>setStep(step-1)}>Back</button>}
        {step < 3 && <button onClick={()=>setStep(step+1)}>Next</button>}
        {step === 3 && <button onClick={handleSubmit}>Submit</button>}
      </div>

    </div>
  );
}
