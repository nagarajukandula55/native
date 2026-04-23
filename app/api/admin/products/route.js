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

  /* ================= GST MASTER (FIXED STRUCTURE) ================= */

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
    "Instant Mixes",
    "Spices & Masalas",
    "Cold Pressed Oils",
    "Flours & Millets",
    "Ready to Cook",
    "Ready to Eat",
    "Pickles & Chutneys",
    "Snacks & Namkeen",
    "Breakfast Essentials",
    "Combo Packs",
    "New Arrivals",
  ];

  /* ================= AUTO PRODUCT KEY + SEO ================= */

  useEffect(() => {
    if (!form.name) return;

    const clean = form.name.replace(/native/gi, "").trim();

    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setProductKey(key);

    const slugGen = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setSlug(slugGen);

    setSeo({
      title: `${form.name} | Buy Online`,
      description: `Buy ${form.name} at best price`,
      keywords: `${form.name}, online, buy`,
    });

  }, [form.name]);

  /* ================= GST AUTO FIX ================= */

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

  /* ================= SAFE VARIANT UPDATE ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];

    updated[i] = {
      ...updated[i],
      [field]: value,
    };

    if (updated[i].value && productKey) {
      const seq = String(i + 1).padStart(3, "0");

      updated[i].sku =
        `NA-${productKey}-${seq}-${updated[i].value}${updated[i].unit}`;
    }

    setForm(prev => ({
      ...prev,
      variants: updated,
    }));
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

  /* ================= IMAGE SAFE ================= */

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

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );

      const json = await res.json();

      if (json?.secure_url) {
        uploaded.push(json.secure_url);
      }
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...uploaded],
    }));
  }

  /* ================= VALIDATION (LOCK SAVE) ================= */

  function validate() {
    if (!form.name) return "Product name required";
    if (!form.category) return "Category required";
    if (!form.gstCategory) return "GST category required";
    if (form.variants.length === 0) return "Add at least one variant";

    const invalidVariant = form.variants.find(
      v => !v.value || !v.mrp || !v.sellingPrice
    );

    if (invalidVariant) return "Fill all variant fields";

    return null;
  }

  /* ================= BARCODE SAFE ================= */

  useEffect(() => {
    form.variants.forEach((v, i) => {
      if (barcodeRefs.current[i] && v.sku) {
        try {
          JsBarcode(barcodeRefs.current[i], v.sku, {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: true,
          });
        } catch (e) {
          console.error("Barcode error:", e);
        }
      }
    });
  }, [form.variants]);

  /* ================= SAVE ================= */

  async function handleSubmit() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");

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

    alert("Product sent for review ✔");

    setForm(emptyForm);
    setImagePreviews([]);
    setStep(0);
  }

  /* ================= SEO ================= */
  
  async function generateAISEO() {
  const res = await fetch("/api/seo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: form.name,
      category: form.category,
    }),
  });

  const data = await res.json();

  if (data.success) {
    setSeo(data.seo);
  }
}

  /* ================= UI ================= */

  return (
    <div className="container">

      <h1>🛒 Product Admin Panel</h1>

      {error && <div className="error">{error}</div>}

      {/* STEPS */}
      <div className="steps">
        <button onClick={() => setStep(0)}>Basic</button>
        <button onClick={() => setStep(1)}>Variants</button>
        <button onClick={() => setStep(2)}>Media</button>
        <button onClick={() => setStep(3)}>SEO</button>
        <button type="button" onClick={generateAISEO}>⚡ Auto Generate SEO</button>
      </div>

      {/* BASIC */}
      {step === 0 && (
        <div className="card">
          <input
            placeholder="Product Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />

          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            <option>Select Category</option>
            {websiteCategories.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={form.gstCategory}
            onChange={e => setForm({ ...form, gstCategory: e.target.value })}
          >
            <option>Select GST</option>
            {gstOptions.map(g => (
              <option key={g.name}>{g.name}</option>
            ))}
          </select>

          <input value={form.hsn} readOnly />
          <input value={form.tax} readOnly />
        </div>
      )}

      {/* VARIANTS */}
      {step === 1 && (
        <div className="card">

          {form.variants.map((v, i) => (
            <div className="row" key={i}>

              <input
                placeholder="Value"
                onChange={e => updateVariant(i, "value", e.target.value)}
              />

              <select
                onChange={e => updateVariant(i, "unit", e.target.value)}
              >
                <option>GM</option>
                <option>KG</option>
                <option>ML</option>
                <option>L</option>
              </select>

              <input
                placeholder="MRP"
                onChange={e => updateVariant(i, "mrp", e.target.value)}
              />

              <input
                placeholder="Selling Price"
                onChange={e => updateVariant(i, "sellingPrice", e.target.value)}
              />

              <input value={v.sku} readOnly />

              <svg ref={el => (barcodeRefs.current[i] = el)} />

              <button type="button" onClick={() => removeVariant(i)}>
                X
              </button>

            </div>
          ))}

          <button type="button" onClick={addVariant}>
            + Add Variant
          </button>

        </div>
      )}

      {/* MEDIA */}
      {step === 2 && (
        <div className="card">
          <input type="file" multiple onChange={handleImageUpload} />

          <div className="imgGrid">
            {imagePreviews.map((img, i) => (
              <img key={i} src={img.preview} />
            ))}
          </div>
        </div>
      )}

      {/* SEO */}
      {step === 3 && (
        <div className="card">
          <input
            value={seo.title}
            onChange={e => setSeo({ ...seo, title: e.target.value })}
          />

          <textarea
            value={seo.description}
            onChange={e =>
              setSeo({ ...seo, description: e.target.value })
            }
          />
        </div>
      )}

      {/* ACTION */}
      <div className="actions">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}

        {step < 3 && (
          <button type="button" onClick={() => setStep(step + 1)}>
            Next
          </button>
        )}

        {step === 3 && (
          <button type="button" onClick={handleSubmit}>
            Send for Review
          </button>
        )}
      </div>

      <style jsx>{`
        .container { max-width: 1100px; margin: auto; padding: 20px; }
        .card { background: #fff; padding: 15px; border-radius: 10px; margin-top: 10px; }
        .row { display: grid; grid-template-columns: repeat(5, 1fr) auto; gap: 10px; margin-bottom: 10px; }
        input, select, textarea { width: 100%; padding: 10px; }
        .steps button { margin: 5px; padding: 8px 12px; }
        .actions { margin-top: 20px; display: flex; gap: 10px; }
        .imgGrid { display: flex; gap: 10px; flex-wrap: wrap; }
        img { width: 80px; height: 80px; object-fit: cover; }
        .error { color: red; margin: 10px 0; }
      `}</style>

    </div>
  );
}

