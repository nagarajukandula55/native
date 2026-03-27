"use client";

import Link from "next/link";

export default function BrandingDashboard() {
  return (
    <div style={{ padding: 30 }}>
      <h1>Branding Dashboard ✅</h1>
      <p>Welcome to your Branding Panel. Here you can manage:</p>

      <ul>
        <li><Link href="/branding/labels">Product Labels</Link></li>
        <li><Link href="/branding/social-posts">Social Media Posts</Link></li>
        <li><Link href="/branding/logos">Logos & Branding Assets</Link></li>
        <li><Link href="/branding/calculators">Price & Nutrition Calculators</Link></li>
      </ul>
    </div>
  );
}
