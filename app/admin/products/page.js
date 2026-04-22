"use client";

import { useState, useEffect } from "react";

export default function ProductUpload() {
  const emptyForm = {
    name: "",
    category: "",
    subCategory: "",
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

  /* ================= AUTO GENERATORS ================= */

  useEffect(() => {
    if (!form.name) return;

    // REMOVE "Native"
    let clean = form.name.replace(/native/gi, "").trim();

    // PRODUCT KEY
    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setProductKey(key);

    // SLUG
    const s = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setSlug(s);

    // SKU PREVIEW (STATIC 001 FOR NOW)
    const variant = `${form.variantValue}${form.variantUnit}`.toUpperCase();

    if (form.variantValue) {
      setSkuPreview(`NA-${key}-001-${variant}`);
    }
  }, [form.name, form.variantValue, form.variantUnit]);

  /* ================= HANDLE CHANGE ================= */

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
      data.append("upload_preset", "your_upload_preset");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`,
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

    const finalSKU = skuPreview;

    const payload = {
      ...form,
      sku: finalSKU,
      productKey,
      slug,
      variant: `${form.variantValue}${form.variantUnit}`.toUpperCase(),
      discount:
        form.mrp && form.sellingPrice
          ? Math.round(
              ((form.mrp - form.sellingPrice) / form.mrp) * 100
            )
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
        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />

        <input
          name="subCategory"
          placeholder="Sub Category"
          value={form.subCategory}
          onChange={handleChange}
        />

        {/* VARIANT */}
        <select name="variantType" value={form.variantType} onChange={handleChange}>
          <option>Weight</option>
          <option>Volume</option>
        </select>

        <input
          name="variantValue"
          placeholder="Value (250, 500, 1)"
          value={form.variantValue}
          onChange={handleChange}
        />

        <select name="variantUnit" value={form.variantUnit} onChange={handleChange}>
          <option>GM</option>
          <option>KG</option>
          <option>ML</option>
          <option>L</option>
        </select>

        {/* PRICING */}
        <input
          name="mrp"
          type="number"
          placeholder="MRP"
          value={form.mrp}
          onChange={handleChange}
        />

        <input
          name="sellingPrice"
          type="number"
          placeholder="Selling Price"
          value={form.sellingPrice}
          onChange={handleChange}
        />

        {/* DESCRIPTION */}
        <textarea
          name="shortDescription"
          placeholder="Short Description"
          value={form.shortDescription}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Full Description"
          value={form.description}
          onChange={handleChange}
        />

        {/* FOOD FIELDS */}
        <input name="ingredients" placeholder="Ingredients" onChange={handleChange} />
        <input name="shelfLife" placeholder="Shelf Life (e.g 6 Months)" onChange={handleChange} />
        <input name="fssai" placeholder="FSSAI Number" onChange={handleChange} />

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
        .container {
          max-width: 900px;
          margin: auto;
          padding: 20px;
        }

        .form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        input, textarea, select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        textarea {
          grid-column: span 2;
        }

        button {
          grid-column: span 2;
          padding: 12px;
          background: black;
          color: white;
          border: none;
          border-radius: 10px;
        }

        .preview {
          grid-column: span 2;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
