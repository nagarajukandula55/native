"use client";

import { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function ProductUpload() {
  const barcodeRef = useRef(null);

  /* ================= CORE (UNCHANGED) ================= */

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
  const [activeTab, setActiveTab] = useState("basic");
  const [barcodeValue, setBarcodeValue] = useState("");

  /* ================= GST (UNCHANGED CORE LOGIC) ================= */

  const gstOptions = [
    {
      name: "Food Preparations (Not Elsewhere Specified)",
      hsn: "2106",
      tax: 5,
      desc: "Includes dosa mix, idli mix, etc.",
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
      desc: "Vegetable oils",
    },
    {
      name: "Prepared / Preserved Foods",
      hsn: "2001",
      tax: 12,
      desc: "Pickles, chutneys, etc",
    },
    {
      name: "Ready to Eat / Packaged Food",
      hsn: "1904",
      tax: 12,
      desc: "Packaged foods",
    },
    {
      name: "Namkeen / Snack Items",
      hsn: "2106",
      tax: 12,
      desc: "Snacks",
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

  /* ================= AUTO SKU + SEO + SLUG ================= */

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
      description: `Premium ${form.name} available online at best price.`,
      keywords: `${form.name}, buy online, best price`,
    });
  }, [form.name]);

  /* ================= GST AUTO ================= */

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

  /* ================= VARIANTS ================= */

  function updateVariant(i, field, value) {
    const updated = [...form.variants];
    updated[i][field] = value;

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

  /* ================= BARCODE ================= */

  useEffect(() => {
    if (barcodeRef.current && productKey) {
      const value = `NA-${productKey}-MASTER`;
      setBarcodeValue(value);

      JsBarcode(barcodeRef.current, value, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
      });
    }
  }, [productKey]);

  function downloadBarcode() {
    const canvas = document.querySelector("#barcodeCanvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${productKey}-barcode.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  /* ================= IMAGE UPLOAD ================= */

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    const previews = files.map(f => ({
      preview: URL.createObjectURL(f),
      uploading: true,
    }));

    setImagePreviews(prev => [...prev, ...previews]);

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
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, ...uploaded],
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

    alert("Product Published");
  }

  /* ================= UI ================= */

  return (
    <div className="wrap">

      {/* HEADER */}
      <div className="header">
        <h1>🛒 Shopify Pro Product Admin</h1>

        <div className="tabs">
          <button onClick={() => setActiveTab("basic")}>Basic</button>
          <button onClick={() => setActiveTab("variants")}>Variants</button>
          <button onClick={() => setActiveTab("media")}>Media</button>
          <button onClick={() => setActiveTab("seo")}>SEO</button>
          <button onClick={() => setActiveTab("barcode")}>Barcode</button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ================= BASIC ================= */}
        {activeTab === "basic" && (
          <div className="grid">
            <input placeholder="Product Name"
              value={form.name}
              onChange={(e)=>setForm({...form,name:e.target.value})}
            />

            <select onChange={(e)=>setForm({...form,category:e.target.value})}>
              <option>Select Category</option>
              {websiteCategories.map(c => <option key={c}>{c}</option>)}
            </select>

            <select onChange={(e)=>setForm({...form,gstCategory:e.target.value})}>
              <option>Select GST Category</option>
              {gstOptions.map(g =>
                <option key={g.name}>{g.name}</option>
              )}
            </select>

            <input value={form.hsn} readOnly />
            <input value={form.tax} readOnly />
            <textarea value={form.gstDescription} readOnly />
          </div>
        )}

        {/* ================= VARIANTS ================= */}
        {activeTab === "variants" && (
          <div>
            {form.variants.map((v,i)=>(
              <div className="row" key={i}>
                <input placeholder="Value"
                  onChange={(e)=>updateVariant(i,"value",e.target.value)} />

                <select onChange={(e)=>updateVariant(i,"unit",e.target.value)}>
                  <option>GM</option>
                  <option>KG</option>
                  <option>ML</option>
                  <option>L</option>
                </select>

                <input placeholder="MRP"
                  onChange={(e)=>updateVariant(i,"mrp",e.target.value)} />

                <input placeholder="Selling"
                  onChange={(e)=>updateVariant(i,"sellingPrice",e.target.value)} />

                <input value={v.sku} readOnly />

                <button type="button" onClick={()=>removeVariant(i)}>X</button>
              </div>
            ))}

            <button type="button" onClick={addVariant}>+ Add Variant</button>
          </div>
        )}

        {/* ================= MEDIA ================= */}
        {activeTab === "media" && (
          <div>
            <input type="file" multiple onChange={handleImageUpload} />

            <div className="imgGrid">
              {imagePreviews.map((img,i)=>(
                <img key={i} src={img.preview} />
              ))}
            </div>
          </div>
        )}

        {/* ================= SEO ================= */}
        {activeTab === "seo" && (
          <div>
            <input value={seo.title}
              onChange={(e)=>setSeo({...seo,title:e.target.value})}/>

            <textarea value={seo.description}
              onChange={(e)=>setSeo({...seo,description:e.target.value})}/>

            <input value={seo.keywords}
              onChange={(e)=>setSeo({...seo,keywords:e.target.value})}/>
          </div>
        )}

        {/* ================= BARCODE ================= */}
        {activeTab === "barcode" && (
          <div>
            <canvas ref={barcodeRef} id="barcodeCanvas"></canvas>

            <button type="button" onClick={downloadBarcode}>
              Download Barcode
            </button>

            <p>{barcodeValue}</p>
          </div>
        )}

        <button type="submit" className="save">
          Publish Product
        </button>

      </form>

      <style jsx>{`
        .wrap{max-width:1100px;margin:auto;padding:20px;}
        .header{display:flex;justify-content:space-between;align-items:center;}
        .tabs button{margin:5px;padding:8px 12px;}
        .grid{display:grid;gap:10px;}
        .row{display:grid;grid-template-columns:repeat(5,1fr) auto;gap:10px;}
        .imgGrid{display:flex;gap:10px;flex-wrap:wrap;}
        img{width:80px;height:80px;object-fit:cover;}
        .save{margin-top:20px;padding:12px 20px;background:black;color:#fff;}
      `}</style>

    </div>
  );
}
