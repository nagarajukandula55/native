"use client";

import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function ProductUpload() {
  const barcodeRef = useRef(null);

  /* ================= CORE (DO NOT REMOVE ANY FIELD) ================= */

  const emptyVariant = {
    value: "",
    unit: "GM",
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
  const [seo, setSeo] = useState({ title: "", description: "", keywords: "" });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [barcodeValue, setBarcodeValue] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);

  /* ================= GST MASTER (LOCKED STANDARD INDIA FORMAT) ================= */

  const gstOptions = [
    { name: "Food Preparations", hsn: "2106", tax: 5, desc: "Packaged food mixes" },
    { name: "Flours & Meals", hsn: "1101", tax: 5, desc: "Cereal flours" },
    { name: "Spices", hsn: "0910", tax: 5, desc: "Spices & masalas" },
    { name: "Edible Oils", hsn: "1515", tax: 5, desc: "Vegetable oils" },
    { name: "Prepared Foods", hsn: "2001", tax: 12, desc: "Pickles & preserved foods" },
    { name: "Ready to Eat", hsn: "1904", tax: 12, desc: "Ready food items" },
    { name: "Snacks", hsn: "2106", tax: 12, desc: "Namkeen & snacks" },
  ];

  const categories = [
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

  /* ================= AUTO PRODUCT KEY + SLUG + SEO ================= */

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
      description: `Premium ${form.name} available at best price`,
      keywords: `${form.name}, buy online`,
    });
  }, [form.name]);

  /* ================= GST AUTO FILL ================= */

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

  /* ================= VARIANT UPDATE ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];
    updated[i][field] = value;
    setForm({ ...form, variants: updated });
  }

  function addVariant() {
    setForm({ ...form, variants: [...form.variants, emptyVariant] });
  }

  function removeVariant(i) {
    setForm({
      ...form,
      variants: form.variants.filter((_, idx) => idx !== i),
    });
  }

  /* ================= IMAGE UPLOAD (SAFE UI ONLY) ================= */

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    const previews = files.map(f => ({
      preview: URL.createObjectURL(f),
    }));

    setImagePreviews(prev => [...prev, ...previews]);

    const uploaded = [];

    for (let f of files) {
      const data = new FormData();
      data.append("file", f);
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

  /* ================= BARCODE ================= */

  useEffect(() => {
    if (!barcodeRef.current || !productKey) return;

    const value = `NA-${productKey}-MASTER`;
    setBarcodeValue(value);

    JsBarcode(barcodeRef.current, value, {
      format: "CODE128",
      width: 2,
      height: 80,
      displayValue: true,
    });
  }, [productKey]);

  /* ================= VALIDATION (LOCK SAVE RULE) ================= */

  function validate() {
    if (!form.name) return "Product name required";
    if (!form.category) return "Category required";
    if (!form.gstCategory) return "GST required";
    if (!form.variants.length) return "At least one variant required";

    for (let v of form.variants) {
      if (!v.value || !v.mrp || !v.sellingPrice) {
        return "All variant fields must be filled";
      }
    }

    return null;
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e) {
    e.preventDefault();

    const err = validate();
    if (err) return alert(err);

    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          productKey,
          slug,
          seo,
          barcode: barcodeValue,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Product Saved Successfully");

      setForm(emptyForm);
      setImagePreviews([]);
    } catch (err) {
      alert("Error saving product");
    }

    setLoading(false);
  }

  /* ================= UI ================= */

  return (
    <div className="wrap">

      <h1>🛒 Shopify Pro Admin Panel (LOCKED SYSTEM)</h1>

      <div className="tabs">
        <button onClick={() => setActiveTab("basic")}>Basic</button>
        <button onClick={() => setActiveTab("variants")}>Variants</button>
        <button onClick={() => setActiveTab("media")}>Media</button>
        <button onClick={() => setActiveTab("seo")}>SEO</button>
        <button onClick={() => setActiveTab("barcode")}>Barcode</button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ================= BASIC ================= */}
        {activeTab === "basic" && (
          <div className="grid">
            <input
              placeholder="Product Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <select
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option>Select Category</option>
              {categories.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              onChange={e => setForm({ ...form, gstCategory: e.target.value })}
            >
              <option>Select GST</option>
              {gstOptions.map(g => (
                <option key={g.name}>{g.name}</option>
              ))}
            </select>

            <input value={form.hsn} readOnly placeholder="HSN" />
            <input value={form.tax} readOnly placeholder="Tax %" />
            <textarea value={form.gstDescription} readOnly />
          </div>
        )}

        {/* ================= VARIANTS ================= */}
        {activeTab === "variants" && (
          <div>
            {form.variants.map((v, i) => (
              <div key={i} className="row">
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

        {/* ================= MEDIA ================= */}
        {activeTab === "media" && (
          <div>
            <input type="file" multiple onChange={handleImageUpload} />

            <div className="imgGrid">
              {imagePreviews.map((img, i) => (
                <img key={i} src={img.preview} />
              ))}
            </div>
          </div>
        )}

        {/* ================= SEO ================= */}
        {activeTab === "seo" && (
          <div>
            <input value={seo.title} readOnly />
            <textarea value={seo.description} readOnly />
            <input value={seo.keywords} readOnly />
          </div>
        )}

        {/* ================= BARCODE ================= */}
        {activeTab === "barcode" && (
          <div>
            <svg ref={barcodeRef}></svg>
            <p>{barcodeValue}</p>
          </div>
        )}

        <button disabled={loading}>
          {loading ? "Saving..." : "Save Product"}
        </button>

      </form>

      <style jsx>{`
        .wrap { max-width: 1100px; margin: auto; padding: 20px; }
        .tabs button { margin: 5px; padding: 8px; }
        .grid { display: grid; gap: 10px; }
        .row { display: grid; grid-template-columns: repeat(4, 1fr) auto; gap: 10px; }
        .imgGrid { display: flex; gap: 10px; flex-wrap: wrap; }
        img { width: 80px; height: 80px; object-fit: cover; }
      `}</style>

    </div>
  );
}
