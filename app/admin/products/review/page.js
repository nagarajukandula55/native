"use client";

import ReviewTab from "@/components/admin/products/ReviewTab";

/** Kept as a standalone route for existing bookmarks/links; the primary
 * entry point is the "Review Queue" tab on /admin/products. */
export default function AdminProductsReviewPage() {
  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 20px", color: "#111827" }}>
        🧠 AI Product Moderation Console
      </h1>
      <ReviewTab />
    </div>
  );
}
