"use client";

import { useEffect, useState } from "react";

export default function Page() {
  return <ProductForm />;
}

function ProductForm() {
  /* ================= STATE ================= */
  const [tab, setTab] = useState("basic");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [gstList, setGstList] = useState([]);

  const [showCat, setShowCat] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showGst, setShowGst] = useState(false);

  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState("");
  const [newGst, setNewGst] = useState({ name: "", gst: "", hsn: "" });

  const [variants, setVariants] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",

    category: "",
    subcategory: "",

    gstCategory: "",
    hsnCode: "",
    gstPercent: "",
    taxIncluded: false,

    costPrice: "",
    mrp: "",
    sellingPrice: "",

    trackInventory: true,
    totalStock: "",
    lowStockAlert: "",
    allowBackorder: false,

    weight: "",
    dimensions: { length: "", width: "", height: "" },

    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",

    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,

    images: [],
    status: "active",
  });

  /* ================= LOAD ================= */
  useEffect(() => {
    loadMasters();
  }, []);

  async function loadMasters() {
    const [c, s, g] = await Promise.all([
      fetch("/api/admin/categories").then(r => r.json()),
      fetch("/api/admin/subcategories").then(r => r.json()),
      fetch("/api/admin/gst").then(r => r.json()),
    ]);

    setCategories(c || []);
    setSubcategories(s || []);
    setGstList(g || []);
  }

  /* ================= HANDLERS ================= */

  function handle(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function handleDim(key, val) {
    setForm({ ...form, dimensions: { ...form.dimensions, [key]: val } });
  }

  function handleGst(e) {
    const g = gstList.find(x => x._id === e.target.value);
    setForm({
      ...form,
      gstCategory: g._id,
      gstPercent: g.gst,
      hsnCode: g.hsn,
    });
  }

  /* ================= AUTO SEO ================= */
  useEffect(() => {
    if (!form.name) return;

    fetch("/api/seo/generate", {
      method: "POST",
      body: JSON.stringify({ name: form.name }),
    })
      .then(r => r.json())
      .then(d => {
        setForm(f => ({
          ...f,
          seoTitle: d.title,
          seoDescription: d.description,
          seoKeywords: d.keywords.join(","),
        }));
      });
  }, [form.name]);

  /* ================= SKU ================= */
  useEffect(() => {
    if (form.name && form.category) {
      const sku = `${form.name.slice(0,3).toUpperCase()}-${Date.now()}`;
      setForm(f => ({ ...f, sku }));
    }
  }, [form.name, form.category]);

  /* ================= IMAGES ================= */
  function handleImages(e) {
    const files = [...e.target.files];
    setForm({ ...form, images: files });
    setImagesPreview(files.map(f => URL.createObjectURL(f)));
  }

  /* ================= VARIANTS ================= */
  function addVariant() {
    setVariants([
      ...variants,
      { type: "", value: "", price: "", stock: "", sku: "" },
    ]);
  }

  function updateVariant(i, k, v) {
    const copy = [...variants];
    copy[i][k] = v;
    if (k === "value") copy[i].sku = form.sku + "-" + v;
    setVariants(copy);
  }

  /* ================= GST ================= */
  const cgst = form.gstPercent / 2;
  const sgst = form.gstPercent / 2;

  /* ================= UI ================= */

  return (
    <div style={{ padding: 20 }}>
      <h2>Product Admin</h2>

      {/* TABS */}
      <div style={tabs}>
        {["basic","category","pricing","inventory","variants","shipping","seo","media"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabBtn(tab===t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={box}>

        {/* BASIC */}
        {tab==="basic" && (
          <>
            <input name="name" placeholder="Name" onChange={handle}/>
            <input name="brand" placeholder="Brand" onChange={handle}/>
            <textarea name="description" placeholder="Description" onChange={handle}/>
          </>
        )}

        {/* CATEGORY */}
        {tab==="category" && (
          <>
            <select value={form.category} onChange={handle} name="category">
              <option>Category</option>
              {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <button onClick={()=>setShowCat(true)}>+ Add</button>

            <select value={form.subcategory} onChange={handle} name="subcategory">
              <option>Subcategory</option>
              {subcategories.filter(s=>s.category===form.category)
                .map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <button onClick={()=>setShowSub(true)}>+ Add</button>

            <select onChange={handleGst}>
              <option>GST</option>
              {gstList.map(g=><option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
            <button onClick={()=>setShowGst(true)}>+ Add</button>
          </>
        )}

        {/* PRICING */}
        {tab==="pricing" && (
          <>
            <input name="costPrice" placeholder="Cost" onChange={handle}/>
            <input name="mrp" placeholder="MRP" onChange={handle}/>
            <input name="sellingPrice" placeholder="Selling" onChange={handle}/>
            <p>GST Split → CGST: {cgst}% | SGST: {sgst}%</p>
          </>
        )}

        {/* INVENTORY */}
        {tab==="inventory" && (
          <>
            <input name="totalStock" placeholder="Total Stock" onChange={handle}/>
            <input name="lowStockAlert" placeholder="Low Alert" onChange={handle}/>
            <label><input type="checkbox" name="trackInventory" onChange={handle}/>Track</label>
            <label><input type="checkbox" name="allowBackorder" onChange={handle}/>Backorder</label>
          </>
        )}

        {/* VARIANTS */}
        {tab==="variants" && (
          <>
            {variants.map((v,i)=>(
              <div key={i}>
                <input placeholder="Type" onChange={e=>updateVariant(i,"type",e.target.value)}/>
                <input placeholder="Value" onChange={e=>updateVariant(i,"value",e.target.value)}/>
                <input placeholder="Price" onChange={e=>updateVariant(i,"price",e.target.value)}/>
                <input placeholder="Stock" onChange={e=>updateVariant(i,"stock",e.target.value)}/>
                <input value={v.sku} readOnly/>
              </div>
            ))}
            <button onClick={addVariant}>+ Variant</button>
          </>
        )}

        {/* SHIPPING */}
        {tab==="shipping" && (
          <>
            <input name="weight" placeholder="Weight" onChange={handle}/>
            <input placeholder="L" onChange={e=>handleDim("length",e.target.value)}/>
            <input placeholder="W" onChange={e=>handleDim("width",e.target.value)}/>
            <input placeholder="H" onChange={e=>handleDim("height",e.target.value)}/>
          </>
        )}

        {/* SEO */}
        {tab==="seo" && (
          <>
            <input value={form.seoTitle||""} readOnly/>
            <textarea value={form.seoDescription||""} readOnly/>
          </>
        )}

        {/* MEDIA */}
        {tab==="media" && (
          <>
            <input type="file" multiple onChange={handleImages}/>
            <div>{imagesPreview.map((i,idx)=><img key={idx} src={i} width={60}/>)}</div>
          </>
        )}

      </div>
    </div>
  );
}

/* STYLES */
const tabs={display:"flex",gap:10};
const tabBtn=a=>({padding:10,background:a?"black":"#ccc",color:a?"#fff":"#000"});
const box={background:"#fff",padding:20,marginTop:20};
