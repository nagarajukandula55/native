"use client";

import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function ProductUpload() {
  const barcodeRef = useRef(null);

  /* ================= CORE (UNCHANGED STRUCTURE) ================= */

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

  const [status, setStatus] = useState("draft");
  const [barcodeValue, setBarcodeValue] = useState("");

  /* ================= GST MASTER (UNCHANGED DATA LOGIC) ================= */

  const gstOptions = [
    {
      name: "Food Preparations (Not Elsewhere Specified)",
      hsn: "2106",
      tax: 5,
      desc: "Includes dosa mix, idli mix, instant food preparations",
    },
    {
      name: "Flours & Meals (Cereal Based)",
      hsn: "1101",
      tax: 5,
      desc: "Cereal, millet, pulse flours",
    },
    {
      name: "Spices",
      hsn: "0910",
      tax: 5,
      desc: "Spices and masalas",
    },
    {
      name: "Edible Oils",
      hsn: "1515",
      tax: 5,
      desc: "Vegetable oils including cold pressed oils",
    },
    {
      name: "Prepared / Preserved Foods",
      hsn: "2001",
      tax: 12,
      desc: "Pickles, chutneys, preserved food items",
    },
    {
      name: "Ready to Eat / Packaged Food",
      hsn: "1904",
      tax: 12,
      desc: "Ready-to-eat packaged foods",
    },
    {
      name: "Namkeen / Snack Items",
      hsn: "2106",
      tax: 12,
      desc: "Snack foods and mixtures",
    },
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

  /* ================= SAFE AUTO GENERATION ================= */

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
      description: `Premium quality ${form.name} available at best price.`,
      keywords: `${form.name}, online shopping, buy ${form.name}`,
    });
  }, [form.name]);

  /* ================= GST AUTO FIXED ================= */

  useEffect(() => {
    const selected = gstOptions.find(
      (g) => g.name === form.gstCategory
    );

    if (selected) {
      setForm((prev) => ({
        ...prev,
        hsn: selected.hsn,
        tax: selected.tax,
        gstDescription: selected.desc,
      }));
    }
  }, [form.gstCategory]);

  /* ================= VARIANT SKU SAFE GENERATION ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];
    updated[i][field] = value;

    if (updated[i].value && productKey) {
      const seq = String(i + 1).padStart(3, "0");

      const cleanValue = `${updated[i].value}${updated[i].unit}`
        .replace(/\s+/g, "")
        .toUpperCase();

      updated[i].sku = `NA-${productKey}-${seq}-${cleanValue}`;
    }

    setForm({ ...form, variants: updated });
  }

  function addVariant() {
    setForm({
      ...form,
      variants: [...form.variants, { ...emptyVariant }],
    });
  }

  function removeVariant(i) {
    setForm({
      ...form,
      variants: form.variants.filter((_, idx) => idx !== i),
    });
  }

  /* ================= IMAGE UPLOAD SAFE ================= */

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    const previews = files.map((file) => ({
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setImagePreviews((prev) => [...prev, ...previews]);

    const uploaded = [];

    for (let i = 0; i < files.length; i++) {
      const data = new FormData();
      data.append("file", files[i]);
      data.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );

      const json = await res.json();

      if (!json.secure_url) continue;

      uploaded.push(json.secure_url);

      setImagePreviews((prev) => {
        const updated = [...prev];
        updated[prev.length - files.length + i] = {
          preview: json.secure_url,
          uploading: false,
        };
        return updated;
      });
    }

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...uploaded],
    }));
  }

  function removeImage(index) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  /* ================= BARCODE FIXED ================= */

  useEffect(() => {
    if (!barcodeRef.current || !productKey) return;

    const value = `NA-${productKey}-MASTER`;
    setBarcodeValue(value);

    JsBarcode(barcodeRef.current, value, {
      format: "CODE128",
      width: 2,
      height: 70,
      displayValue: true,
    });
  }, [productKey]);

  /* ================= VALIDATION (BLOCK INCOMPLETE SAVE) ================= */

  function validateForm() {
    if (!form.name) return "Product name required";
    if (!form.category) return "Category required";
    if (!form.gstCategory) return "GST category required";
    if (!form.variants.length) return "At least one variant required";

    for (let v of form.variants) {
      if (!v.value || !v.mrp || !v.sellingPrice) {
        return "All variant fields required";
      }
    }

    return null;
  }

  /* ================= SUBMIT SAFE ================= */

  async function handleSubmit(e) {
    e.preventDefault();

    const error = validateForm();
    if (error) return alert(error);

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
          status,
        }),
      });
    }

    alert("Product Published Successfully");
  }

  /* ================= UI (UNCHANGED STRUCTURE) ================= */

  return (
    <div className="wrap">

      <h1>Product Admin (Locked Core)</h1>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        >
          <option value="">Select Category</option>
          {websiteCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={form.gstCategory}
          onChange={(e) =>
            setForm({ ...form, gstCategory: e.target.value })
          }
        >
          <option value="">Select GST Category</option>
          {gstOptions.map((g) => (
            <option key={g.name}>
              {g.name} ({g.tax}%)
            </option>
          ))}
        </select>

        <input value={form.hsn} readOnly />
        <input value={form.tax} readOnly />
        <textarea value={form.gstDescription} readOnly />

        <h3>Variants</h3>

        {form.variants.map((v, i) => (
          <div key={i} className="row">

            <input
              placeholder="Value"
              onChange={(e) =>
                updateVariant(i, "value", e.target.value)
              }
            />

            <select
              onChange={(e) =>
                updateVariant(i, "unit", e.target.value)
              }
            >
              <option>GM</option>
              <option>KG</option>
              <option>ML</option>
              <option>L</option>
            </select>

            <input
              placeholder="MRP"
              onChange={(e) =>
                updateVariant(i, "mrp", e.target.value)
              }
            />

            <input
              placeholder="Selling Price"
              onChange={(e) =>
                updateVariant(i, "sellingPrice", e.target.value)
              }
            />

            <input value={v.sku} readOnly />

            <button type="button" onClick={() => removeVariant(i)}>
              X
            </button>
          </div>
        ))}

        <button type="button" onClick={addVariant}>
          + Add Variant
        </button>

        <input type="file" multiple onChange={handleImageUpload} />

        <div className="imgGrid">
          {imagePreviews.map((img, i) => (
            <img key={i} src={img.preview} />
          ))}
        </div>

        <canvas ref={barcodeRef}></canvas>

        <button type="submit">Publish Product</button>

      </form>

      <style jsx>{`
        .wrap { max-width: 1000px; margin: auto; padding: 20px; }
        input, select, textarea { width: 100%; padding: 10px; margin: 8px 0; }
        .row { display: grid; grid-template-columns: repeat(5, 1fr) auto; gap: 10px; }
        .imgGrid { display: flex; gap: 10px; flex-wrap: wrap; }
        img { width: 80px; height: 80px; object-fit: cover; }
      `}</style>

    </div>
  );
}
