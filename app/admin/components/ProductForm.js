"use client";

import { useEffect, useState } from "react";

export default function ProductForm({ refresh, editing, setEditing }) {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    costPrice: "",
    mrp: "",
    sellingPrice: "",
    status: "active",
    description: "",
    images: [],
  });

  useEffect(() => {
    if (editing) setForm(editing);
  }, [editing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit() {
    const fd = new FormData();

    Object.keys(form).forEach((k) => fd.append(k, form[k]));
    form.images?.forEach((img) => fd.append("images", img));

    if (editing) fd.append("_id", editing._id);

    await fetch("/api/admin/products", {
      method: editing ? "PUT" : "POST",
      body: fd,
    });

    setForm({});
    setEditing(null);
    refresh();
  }

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        {editing ? "Edit Product" : "Add Product"}
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="brand" placeholder="Brand" onChange={handleChange} />
        <input name="costPrice" placeholder="Cost" onChange={handleChange} />
        <input name="mrp" placeholder="MRP" onChange={handleChange} />
        <input name="sellingPrice" placeholder="Selling" onChange={handleChange} />
      </div>

      <textarea
        placeholder="Description"
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <input type="file" multiple onChange={(e) => setForm({ ...form, images: [...e.target.files] })} />

      <button
        onClick={submit}
        className="bg-black text-white px-6 py-2 rounded-xl"
      >
        {editing ? "Update" : "Create"}
      </button>
    </div>
  );
}
