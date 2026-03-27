"use client";

import { useEffect, useState } from "react";

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);

  const fetchAssets = async () => {
    const res = await fetch("/api/branding/assets");
    const data = await res.json();
    if (data.success) setAssets(data.assets);
  };

  useEffect(() => fetchAssets(), []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Brand Assets / Logos</h1>
      <button style={{ marginBottom: 10, padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6 }}>
        Upload New Asset
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {assets.map((a) => (
          <div key={a._id} style={{ width: 120, textAlign: "center" }}>
            <img src={a.url} alt={a.name} style={{ width: 100, height: 100, objectFit: "contain" }} />
            <p>{a.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
