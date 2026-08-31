"use client";

import { useState } from "react";
import UploadTab from "@/components/admin/products/UploadTab";
import ListTab from "@/components/admin/products/ListTab";
import ReviewTab from "@/components/admin/products/ReviewTab";

const TABS = [
  { key: "upload", label: "Add Product" },
  { key: "list", label: "Live Products" },
  { key: "review", label: "Review Queue" },
];

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 34, fontWeight: 700, margin: 0, color: "#111827" }}>
        Product Admin
      </h1>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, margin: "20px 0 24px" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: activeTab === t.key ? "#111827" : "#fff",
              color: activeTab === t.key ? "#fff" : "#111827",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "upload" && <UploadTab onSubmitted={() => setActiveTab("list")} />}
      {activeTab === "list" && <ListTab />}
      {activeTab === "review" && <ReviewTab />}
    </div>
  );
}
