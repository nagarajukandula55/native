"use client";

import { useState, useEffect } from "react";

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

  const [status, setStatus] = useState("draft");

  /* ================= GST CONFIG ================= */

  const gstOptions = [
    {
      name: "Food Preparations (Not Elsewhere Specified)",
      hsn: "2106",
      tax: 5,
      desc: "Food preparations not elsewhere specified (includes dosa mix, idli mix)",
    },
    {
      name: "Flours & Meals (Cereal Based)",
      hsn: "1101",
      tax: 5,
      desc: "Flours of cereals, pulses, millets",
    },
    {
      name: "Spices",
      hsn: "0910",
      tax: 5,
      desc: "Spices including masalas",
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
      desc: "Pickles, chutneys, preserved foods",
    },
    {
      name: "Ready to Eat / Packaged Food",
      hsn: "1904",
      tax: 12,
      desc: "Packaged ready to eat food",
    },
    {
      name: "Namkeen / Snack Items",
      hsn: "2106",
      tax: 12,
      desc: "Snacks and mixtures",
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

  /* ================= AUTO ================= */

  useEffect(() => {
    if (!form.name) return;

    let clean = form.name.replace(/native/gi, "").trim();

    const key = clean.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setProductKey(key);

    const slugGen = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setSlug(slugGen);

    /* SEO AUTO */
    setSeo({
      title: `${form.name} | Buy Online`,
      description: `Buy ${form.name} at best price. Premium quality product.`,
      keywords: `${form.name}, buy ${form.name}, online`,
    });

  }, [form.name]);

  /* ================= GST AUTO (FIXED) ================= */

  useEffect(() => {
    if (!form.gstCategory) return;

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

  /* ================= VARIANTS ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];
    updated[i][field] = value;

    // SKU AUTO FIX
    if (updated[i].value && productKey) {
      const seq = String(i + 1).padStart(3, "0");
      updated[i].sku = `NA-${productKey}-${seq}-${updated[i].value}${updated[i].unit}`;
    }

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

  /* ================= BULK VARIANTS ================= */

  function generateVariants() {
    const sizes = ["250GM", "500GM", "1KG"];

    const newVariants = sizes.map((s, i) => ({
      value: s.replace(/[A-Z]/g, ""),
      unit: s.replace(/[0-9]/g, ""),
      sku: `NA-${productKey}-${String(i + 1).padStart(3, "0")}-${s}`,
      mrp: "",
      sellingPrice: "",
    }));

    setForm({ ...form, variants: newVariants });
  }

  /* ================= IMAGE UPLOAD ================= */

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
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );

      const json = await res.json();
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

  /* ================= SUBMIT ================= */

  async function handleSubmit(e) {
    e.preventDefault();

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

    alert("Product Added");
  }

  /* ================= UI ================= */

  return (
    <div className="container">

      <h1>Product Upload</h1>

      <form onSubmit={handleSubmit}>

        <input placeholder="Product Name"
          value={form.name}
          onChange={(e)=>setForm({...form,name:e.target.value})}
        />

        <select value={form.category}
          onChange={(e)=>setForm({...form,category:e.target.value})}>
          <option value="">Select Category</option>
          {websiteCategories.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>

        {/* GST */}
        <select value={form.gstCategory}
          onChange={(e)=>setForm({...form,gstCategory:e.target.value})}>
          <option value="">Select GST Category</option>
          {gstOptions.map(g=>(
            <option key={g.name} value={g.name}>
              {g.name} ({g.tax}%)
            </option>
          ))}
        </select>

        <input value={form.hsn} readOnly placeholder="HSN Code"/>
        <input value={form.tax} readOnly placeholder="Tax %"/>
        <textarea value={form.gstDescription} readOnly />

        {/* VARIANTS */}
        <h3>Variants</h3>

        {form.variants.map((v,i)=>(
          <div key={i} className="row">
            <input placeholder="Value"
              onChange={(e)=>updateVariant(i,"value",e.target.value)} />

            <select onChange={(e)=>updateVariant(i,"unit",e.target.value)}>
              <option>GM</option><option>KG</option><option>ML</option><option>L</option>
            </select>

            <input placeholder="MRP"
              onChange={(e)=>updateVariant(i,"mrp",e.target.value)} />

            <input placeholder="Selling Price"
              onChange={(e)=>updateVariant(i,"sellingPrice",e.target.value)} />

            <input value={v.sku} readOnly />

            <button type="button" onClick={()=>removeVariant(i)}>X</button>
          </div>
        ))}

        <button type="button" onClick={generateVariants}>Auto Variants</button>
        <button type="button" onClick={addVariant}>+ Add Variant</button>

        {/* IMAGE */}
        <input type="file" multiple onChange={handleImageUpload} />

        <div className="imgGrid">
          {imagePreviews.map((img,i)=>(
            <div key={i}>
              <img src={img.preview}/>
              <button type="button" onClick={()=>removeImage(i)}>X</button>
            </div>
          ))}
        </div>

        {/* SEO */}
        <input value={seo.title} onChange={(e)=>setSeo({...seo,title:e.target.value})}/>
        <textarea value={seo.description} onChange={(e)=>setSeo({...seo,description:e.target.value})}/>
        <input value={seo.keywords} onChange={(e)=>setSeo({...seo,keywords:e.target.value})}/>

        <button>Add Product</button>

      </form>

      <style jsx>{`
        .container{max-width:900px;margin:auto;padding:20px;}
        input,select,textarea{width:100%;padding:10px;margin:8px 0;}
        .row{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 2fr auto;gap:10px;}
        .imgGrid{display:flex;gap:10px;flex-wrap:wrap;}
        img{width:80px;height:80px;object-fit:cover;}
      `}</style>

    </div>
  );
}
