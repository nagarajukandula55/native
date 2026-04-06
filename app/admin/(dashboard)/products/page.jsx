"use client";

import { useEffect, useState } from "react";

export default function Page() {
  return <ProductForm />;
}

function ProductForm() {
  /* ================= STATE ================= */

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [gstList, setGstList] = useState([]);

  const [showCat, setShowCat] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showGst, setShowGst] = useState(false);

  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState("");
  const [newGst, setNewGst] = useState({ name: "", gst: "", hsn: "" });

  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",

    category: "",
    subcategory: "",

    gstCategory: "",
    gstPercent: 0,
    hsnCode: "",

    costPrice: 0,
    mrp: 0,
    sellingPrice: 0,

    taxIncluded: false,

    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",

    images: [],
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

  /* ================= CATEGORY CREATE (FIXED) ================= */

  async function createCategory() {
    if (!newCat) return alert("Enter category name");

    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCat }),
    });

    setNewCat("");
    setShowCat(false);
    loadMasters(); // 🔥 refresh dropdown
  }

  async function createSubcategory() {
    if (!newSub || !form.category)
      return alert("Select category + enter subcategory");

    await fetch("/api/admin/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newSub,
        category: form.category,
      }),
    });

    setNewSub("");
    setShowSub(false);
    loadMasters();
  }

  async function createGst() {
    if (!newGst.name || !newGst.gst)
      return alert("Fill GST details");

    await fetch("/api/admin/gst", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGst),
    });

    setNewGst({ name: "", gst: "", hsn: "" });
    setShowGst(false);
    loadMasters();
  }

  /* ================= GST AUTO ================= */

  function handleGst(e) {
    const g = gstList.find(x => x._id === e.target.value);

    setForm({
      ...form,
      gstCategory: g._id,
      gstPercent: g.gst,
      hsnCode: g.hsn,
    });
  }

  /* ================= PRICING AUTO ================= */

  const gstAmount = (form.sellingPrice * form.gstPercent) / 100;
  const finalPrice = form.taxIncluded
    ? form.sellingPrice
    : Number(form.sellingPrice) + gstAmount;

  const profit =
    Number(form.sellingPrice) - Number(form.costPrice);

  /* ================= SEO AUTO ================= */

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

  /* ================= IMAGE ================= */

  function handleImages(e) {
    const files = [...e.target.files];
    setForm({ ...form, images: files });
  }

  /* ================= SAVE ================= */

  async function save() {
    const fd = new FormData();

    Object.keys(form).forEach(k => {
      if (k !== "images") fd.append(k, form[k]);
    });

    form.images.forEach(img => fd.append("images", img));

    await fetch("/api/admin/products", {
      method: "POST",
      body: fd,
    });

    alert("Saved");
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 20 }}>
      <h2>Product</h2>

      {/* BASIC */}
      <h3>Basic</h3>
      <input name="name" placeholder="Name" onChange={handle} />
      <input name="brand" placeholder="Brand" onChange={handle} />
      <textarea name="description" placeholder="Description" onChange={handle} />

      {/* CATEGORY */}
      <h3>Category</h3>

      <select name="category" onChange={handle}>
        <option>Category</option>
        {categories.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
      <button onClick={() => setShowCat(true)}>+ Add</button>

      <select name="subcategory" onChange={handle}>
        <option>Subcategory</option>
        {subcategories
          .filter(s => s.category === form.category)
          .map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
      </select>
      <button onClick={() => setShowSub(true)}>+ Add</button>

      <select onChange={handleGst}>
        <option>GST</option>
        {gstList.map(g => (
          <option key={g._id} value={g._id}>
            {g.name} ({g.gst}%)
          </option>
        ))}
      </select>
      <button onClick={() => setShowGst(true)}>+ Add</button>

      {/* MODALS */}
      {showCat && (
        <div>
          <input value={newCat} onChange={e => setNewCat(e.target.value)} />
          <button onClick={createCategory}>Save</button>
        </div>
      )}

      {showSub && (
        <div>
          <input value={newSub} onChange={e => setNewSub(e.target.value)} />
          <button onClick={createSubcategory}>Save</button>
        </div>
      )}

      {showGst && (
        <div>
          <input placeholder="Name" onChange={e => setNewGst({ ...newGst, name: e.target.value })} />
          <input placeholder="GST%" onChange={e => setNewGst({ ...newGst, gst: e.target.value })} />
          <input placeholder="HSN" onChange={e => setNewGst({ ...newGst, hsn: e.target.value })} />
          <button onClick={createGst}>Save</button>
        </div>
      )}

      {/* PRICING */}
      <h3>Pricing</h3>
      <input name="costPrice" placeholder="Cost" onChange={handle} />
      <input name="mrp" placeholder="MRP" onChange={handle} />
      <input name="sellingPrice" placeholder="Selling Price" onChange={handle} />

      <label>
        <input type="checkbox" name="taxIncluded" onChange={handle} />
        Tax Included
      </label>

      <p>GST: {form.gstPercent}%</p>
      <p>GST Amount: ₹{gstAmount.toFixed(2)}</p>
      <p>Final Price: ₹{finalPrice.toFixed(2)}</p>
      <p>Profit: ₹{profit.toFixed(2)}</p>

      {/* SEO */}
      <h3>SEO (Auto)</h3>
      <input value={form.seoTitle} readOnly />
      <textarea value={form.seoDescription} readOnly />

      {/* IMAGES */}
      <h3>Images</h3>
      <input type="file" multiple onChange={handleImages} />

      <button onClick={save}>Save Product</button>
    </div>
  );
}
