"use client";

import { useState, useEffect } from "react";

export default function ProductUpload() {
  const emptyForm = {
    name: "",
    category: "",
    gstCategory: "",
    hsn: "",
    tax: "",
    mrp: "",
    sellingPrice: "",
    shortDescription: "",
    description: "",
    variantType: "Weight",
    variantValue: "",
    variantUnit: "GM",
    images: [],
  };

  const [form, setForm] = useState(emptyForm);
  const [skuPreview, setSkuPreview] = useState("");
  const [productKey, setProductKey] = useState("");
  const [slug, setSlug] = useState("");

  /* ================= GST CONFIG ================= */

  const gstOptions = [
    { name: "Unbranded Food Items", hsn: "1106", tax: 0, desc: "Basic food items" },
    { name: "Branded Packaged Food", hsn: "2106", tax: 5, desc: "Packaged food items like dosa mix" },
    { name: "Processed Food", hsn: "2008", tax: 12, desc: "Processed edible items" },
    { name: "Ready to Eat", hsn: "1904", tax: 5, desc: "Instant ready food" },
  ];

  /* ================= AUTO GENERATORS ================= */

  useEffect(() => {
    if (!form.name) return;

    let clean = form.name.replace(/native/gi, "").trim();

    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setProductKey(key);

    const s = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setSlug(s);

    const variant = `${form.variantValue}${form.variantUnit}`.toUpperCase();

    if (form.variantValue) {
      setSkuPreview(`NA-${key}-001-${variant}`);
    }
  }, [form.name, form.variantValue, form.variantUnit]);

  /* ================= GST AUTO ================= */

  useEffect(() => {
    const selected = gstOptions.find((g) => g.name === form.gstCategory);
    if (selected) {
      setForm((prev) => ({ ...prev, hsn: selected.hsn, tax: selected.tax }));
    }
  }, [form.gstCategory]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ================= IMAGE UPLOAD ================= */

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const uploaded = [];

    for (let file of files) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const json = await res.json();
      uploaded.push(json.secure_url);
    }

    setForm({ ...form, images: [...form.images, ...uploaded] });
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.variantValue || !form.sellingPrice) {
      return alert("Fill required fields");
    }

    const payload = {
      ...form,
      sku: skuPreview,
      productKey,
      slug,
      variant: `${form.variantValue}${form.variantUnit}`.toUpperCase(),
      discount:
        form.mrp && form.sellingPrice
          ? Math.round(((form.mrp - form.sellingPrice) / form.mrp) * 100)
          : 0,
    };

    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Product Added");
    setForm(emptyForm);
  }

  /* ================= UI ================= */

  return (
    <div className="container">
      <h1>🍽 Product Upload</h1>

      <form onSubmit={handleSubmit} className="form">
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Website Category</option>
          <option value="food">Food</option>
          <option value="snacks">Snacks</option>
        </select>

        {/* GST CATEGORY */}
        <select name="gstCategory" value={form.gstCategory} onChange={handleChange}>
          <option value="">Select GST Category</option>
          {gstOptions.map((g) => (
            <option key={g.name} value={g.name}>
              {g.name} ({g.tax}%)
            </option>
          ))}
        </select>

        <input name="hsn" placeholder="HSN Code" value={form.hsn} readOnly />
        <input name="tax" placeholder="Tax %" value={form.tax} readOnly />

        {/* VARIANT */}
        <select name="variantType" value={form.variantType} onChange={handleChange}>
          <option>Weight</option>
          <option>Volume</option>
        </select>

        <input name="variantValue" placeholder="Value" value={form.variantValue} onChange={handleChange} />

        <select name="variantUnit" value={form.variantUnit} onChange={handleChange}>
          <option>GM</option>
          <option>KG</option>
          <option>ML</option>
          <option>L</option>
        </select>

        {/* PRICING */}
        <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="sellingPrice" type="number" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} />

        {/* DESCRIPTION */}
        <textarea name="shortDescription" placeholder="Short Description" value={form.shortDescription} onChange={handleChange} />
        <textarea name="description" placeholder="Full Description" value={form.description} onChange={handleChange} />

        {/* FOOD */}
        <input name="ingredients" placeholder="Ingredients" onChange={handleChange} />
        <input name="shelfLife" placeholder="Shelf Life" onChange={handleChange} />
        <input name="fssai" placeholder="FSSAI" onChange={handleChange} />

        {/* IMAGES */}
        <input type="file" multiple onChange={handleImageUpload} />

        <div className="preview">
          <p><b>SKU:</b> {skuPreview}</p>
          <p><b>Slug:</b> {slug}</p>
          <p><b>Product Key:</b> {productKey}</p>
        </div>

        <button>Add Product</button>
      </form>

      <style jsx>{`
        .container { max-width: 900px; margin: auto; padding: 20px; }
        .form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        input, textarea, select { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        textarea { grid-column: span 2; }
        button { grid-column: span 2; padding: 12px; background: black; color: white; border: none; border-radius: 10px; }
        .preview { grid-column: span 2; background: #f5f5f5; padding: 10px; border-radius: 8px; }
      `}</style>
    </div>
  );
}
