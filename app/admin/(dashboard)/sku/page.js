"use client";

import { useEffect, useState } from "react";

export default function SKUPage() {
  const [skus, setSkus] = useState([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    price: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/sku");
    const json = await res.json();
    if (json.success) setSkus(json.skus);
  }

  async function createSKU() {
    const res = await fetch("/api/admin/sku", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    if (json.success) {
      alert("✅ SKU Created");
      setForm({ name: "", code: "", price: "" });
      load();
    } else {
      alert(json.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 SKU Management</h1>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <button onClick={createSKU}>Create</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {skus.map((s) => (
          <div key={s._id}>
            {s.name} ({s.code})
          </div>
        ))}
      </div>
    </div>
  );
}
