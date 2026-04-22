"use client";

import { useState, useEffect } from "react";

export default function ProductUpload() {
  const emptyForm = {
    name: "",
    category: "",
    gstCategory: "",
    gstDescription: "",
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
    ingredients: "",
    shelfLife: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [skuPreview, setSkuPreview] = useState("");
  const [productKey, setProductKey] = useState("");
  const [slug, setSlug] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  /* ================= GST CONFIG ================= */

  const gstOptions = [
    { name: "Food Preparations (Instant Mix)", hsn: "2106", tax: 5, desc: "Food preparations not elsewhere specified or included" },
    { name: "Spices (Mixed/Ground)", hsn: "0910", tax: 5, desc: "Spices including mixed masalas" },
    { name: "Edible Oils", hsn: "1513", tax: 5, desc: "Vegetable oils including cold pressed oils" },
    { name: "Flours & Atta", hsn: "1101", tax: 5, desc: "Cereal flours like wheat, millet, rice flour" },
    { name: "Pickles & Preserved Foods", hsn: "2001", tax: 12, desc: "Preserved vegetables/fruits" },
    { name: "Ready to Eat Foods", hsn: "2106", tax: 12, desc: "Fully cooked packaged foods" },
    { name: "Snacks / Namkeen", hsn: "2106", tax: 12, desc: "Namkeen & fried snacks" },
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

  /* ================= AUTO ================= */

  useEffect(() => {
    if (!form.name) return;

    let clean = form.name.replace(/native/gi, "").trim();

    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setProductKey(key);

    const slugGen = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setSlug(slugGen);

    if (!form.variantValue) return;

    const variant = `${form.variantValue}${form.variantUnit}`.toUpperCase();

    setSkuPreview(`NA-${key}-001-${variant}`);
  }, [form.name, form.variantValue, form.variantUnit]);

  useEffect(() => {
    if (!form.gstCategory) return;

    const selected = gstOptions.find((g) => g.name === form.gstCategory);

    if (selected) {
      setForm((prev) => ({
        ...prev,
        hsn: selected.hsn,
        tax: selected.tax,
        gstDescription: selected.desc,
      }));
    }
  }, [form.gstCategory]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* ================= IMAGE UPLOAD ================= */

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    const previews = files.map((file) => ({
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setImagePreviews((prev) => [...prev, ...previews]);

    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const data = new FormData();
      data.append("file", files[i]);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: data }
        );

        const json = await res.json();
        uploadedUrls.push(json.secure_url);

        setImagePreviews((prev) => {
          const updated = [...prev];
          updated[prev.length - files.length + i] = {
            preview: json.secure_url,
            uploading: false,
          };
          return updated;
        });
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));
  }

  function removeImage(index) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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
    setImagePreviews([]);
  }

  const discount =
    form.mrp && form.sellingPrice
      ? Math.round(((form.mrp - form.sellingPrice) / form.mrp) * 100)
      : 0;

  /* ================= UI ================= */

  return (
    <div className="container">
      <h1>🍽 Product Upload</h1>

      <form onSubmit={handleSubmit} className="form">

        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />

        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Website Category</option>
          {websiteCategories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select name="gstCategory" value={form.gstCategory} onChange={handleChange}>
          <option value="">Select GST Category</option>
          {gstOptions.map((g) => (
            <option key={g.name}>{g.name} ({g.tax}%)</option>
          ))}
        </select>

        <input value={form.hsn} readOnly placeholder="HSN Code" />
        <input value={form.tax} readOnly placeholder="Tax %" />

        <textarea className="full" value={form.gstDescription} readOnly placeholder="GST Description" />

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

        <input name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} />
        <input name="sellingPrice" type="number" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} />

        <textarea className="full" name="shortDescription" placeholder="Short Description" value={form.shortDescription} onChange={handleChange} />
        <textarea className="full" name="description" placeholder="Full Description" value={form.description} onChange={handleChange} />

        <input name="ingredients" placeholder="Ingredients" value={form.ingredients} onChange={handleChange} />
        <input name="shelfLife" placeholder="Shelf Life" value={form.shelfLife} onChange={handleChange} />

        <input type="file" multiple onChange={handleImageUpload} />

        {/* IMAGE PREVIEW */}
        <div className="imageGrid full">
          {imagePreviews.map((img, i) => (
            <div key={i} className="imgBox">
              <img src={img.preview} />
              {img.uploading && <div className="overlay">Uploading...</div>}
              <button type="button" onClick={() => removeImage(i)}>✕</button>
            </div>
          ))}
        </div>

        <div className="preview full">
          <p><b>SKU:</b> {skuPreview}</p>
          <p><b>Slug:</b> {slug}</p>
          <p><b>Product Key:</b> {productKey}</p>
          <p><b>Discount:</b> {discount}%</p>
        </div>

        <button className="full">Add Product</button>
      </form>

      <style jsx>{`
        .container { max-width: 900px; margin: auto; padding: 20px; }

        .form {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        input, textarea, select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .full { grid-column: span 2; }

        .imageGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          gap: 10px;
        }

        .imgBox { position: relative; }

        .imgBox img {
          width: 100%;
          height: 90px;
          object-fit: cover;
          border-radius: 8px;
        }

        .imgBox button {
          position: absolute;
          top: 5px;
          right: 5px;
          background: red;
          color: white;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          color: white;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        button {
          padding: 12px;
          background: black;
          color: white;
          border: none;
          border-radius: 10px;
        }

        .preview {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
