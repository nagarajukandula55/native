"use client";

import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function ProductUpload() {

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

  function removeVariant(i) {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== i),
    }));
  }

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
      console.log("Cloudinary:", json);

      if (json?.secure_url) {
        uploaded.push(json.secure_url);
      }
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...uploaded],
    }));
  }

  function validate() {
    if (!form.name) return "Product name required";
    if (!form.category) return "Category required";
    if (!form.gstCategory) return "GST category required";
    if (!form.images.length) return "Upload at least 1 image";

    const invalidVariant = form.variants.find(
      v => !v.value || !v.mrp || !v.sellingPrice
    );

    if (invalidVariant) return "Fill all variant fields";

    return null;
  }

  useEffect(() => {
    form.variants.forEach((v, i) => {
      if (barcodeRefs.current[i] && v.sku) {
        JsBarcode(barcodeRefs.current[i], v.sku);
      }
    });
  }, [form.variants]);

  async function handleSubmit() {
    const err = validate();
    if (err) return setError(err);

    setError("");

    for (let v of form.variants) {

      const payload = {
        name: form.name,
        category: form.category,
        gstCategory: form.gstCategory,
        hsn: form.hsn,
        tax: form.tax,
        description: form.description,
        shortDescription: form.shortDescription,
        ingredients: form.ingredients,
        shelfLife: form.shelfLife,
        images: form.images,

        variant: `${v.value}${v.unit}`,
        sku: v.sku,
        mrp: Number(v.mrp),
        sellingPrice: Number(v.sellingPrice),

        productKey,
        slug,
        seo,
        status: "review",
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        console.error("SAVE ERROR:", data);
        setError("Failed to save product");
        return;
      }
    }

    alert("Product sent for review ✔");
    setForm(emptyForm);
    setImagePreviews([]);
    setStep(0);
  }

  async function generateAISEO() {
    const res = await fetch("/api/seo", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        name: form.name,
        category: form.category,
      }),
    });

    const data = await res.json();
    if (data.success) setSeo(data.seo);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "auto", padding: 20 }}>
      <h1>🛒 Product Admin Panel</h1>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={()=>setStep(0)}>Basic</button>
        <button onClick={()=>setStep(1)}>Variants</button>
        <button onClick={()=>setStep(2)}>Media</button>
        <button onClick={()=>setStep(3)}>SEO</button>
        <button onClick={generateAISEO}>⚡ SEO</button>
      </div>

      {step === 0 && (
        <div>
          <input placeholder="Product Name (e.g. Native Dosa Mix 500g)"
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}/>
        </div>
      )}

      {step === 1 && (
        <div>
          {form.variants.map((v,i)=>(
            <div key={i}>
              <input placeholder="Weight (e.g. 500)"
                onChange={e=>updateVariant(i,"value",e.target.value)}/>
              <input placeholder="MRP (₹)"
                onChange={e=>updateVariant(i,"mrp",e.target.value)}/>
              <input placeholder="Selling Price (₹)"
                onChange={e=>updateVariant(i,"sellingPrice",e.target.value)}/>
              <input value={v.sku} readOnly/>
            </div>
          ))}
          <button onClick={addVariant}>Add Variant</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <input type="file" multiple onChange={handleImageUpload}/>
        </div>
      )}

      {step === 3 && (
        <button onClick={handleSubmit}>Submit</button>
      )}

    </div>
  );
}
