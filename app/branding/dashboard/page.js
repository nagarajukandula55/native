"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function BrandingDashboard() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Check out our products!");
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [bgColors, setBgColors] = useState(["#ffffff", "#f3f4f6", "#2563eb"]); // multiple templates
  const postRef = useRef(null);

  /* Fetch Labels */
  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
    setLoading(false);
  };

  useEffect(() => { fetchLabels(); }, []);

  /* Generate PDF Label */
  const generatePDFLabel = (label) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Product: ${label.name}`, 10, 10);
    doc.text(`SKU: ${label.sku}`, 10, 20);
    doc.text(`Size: ${label.size}, Quality: ${label.quality}`, 10, 30);
    doc.text(`Price: ₹${label.price}`, 10, 40);
    doc.save(`${label.name}_label.pdf`);
  };

  /* Generate Multiple Social Posts */
  const generateAllSocialPosts = async (label) => {
    if (!postRef.current) return;

    for (let i = 0; i < bgColors.length; i++) {
      const element = postRef.current;

      // Populate template
      element.style.backgroundColor = bgColors[i];
      element.querySelector("#postLogo").src = logoUrl;
      element.querySelector("#postGreeting").innerText = greeting;
      element.querySelector("#postProductName").innerText = label.name;
      element.querySelector("#postSKU").innerText = label.sku;
      element.querySelector("#postSize").innerText = label.size;
      element.querySelector("#postQuality").innerText = label.quality;
      element.querySelector("#postPrice").innerText = `₹${label.price}`;

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [1080, 1080],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 1080, 1080);
      pdf.save(`${label.name}_social_post_template_${i + 1}.pdf`);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Branding Dashboard</h1>

      {/* Brand Settings */}
      <div style={brandSettings}>
        <h2>Brand Settings</h2>
        <label>
          Logo URL:
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Default Greeting:
          <input
            type="text"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Background Colors (comma separated hex):
          <input
            type="text"
            value={bgColors.join(",")}
            onChange={(e) =>
              setBgColors(
                e.target.value.split(",").map((c) => c.trim())
              )
            }
            style={inputStyle}
          />
        </label>
      </div>

      <div style={{ margin: "20px 0" }}>
        <Link href="/branding/labels/create" style={{ color: "#2563eb" }}>
          + Create New Label
        </Link>
      </div>

      {/* Existing Labels */}
      <h2>Existing Labels</h2>
      {labels.length === 0 && <p>No labels created yet.</p>}

      {labels.map(label => (
        <div key={label._id} style={labelCard}>
          <h3>{label.name} ({label.sku})</h3>
          <p>Size: {label.size}, Quality: {label.quality}</p>
          <p>Price: ₹{label.price}</p>
          <p>Nutrition: Calories {label.nutrition?.calories}, Protein {label.nutrition?.protein}, Fat {label.nutrition?.fat}, Carbs {label.nutrition?.carbs}</p>

          <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
            <Link href={`/branding/labels/edit/${label._id}`} style={{ color: "blue" }}>
              Edit
            </Link>
            <button
              onClick={async () => {
                if (!confirm("Delete this label?")) return;
                await fetch("/api/branding/labels", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: label._id }),
                });
                fetchLabels();
              }}
              style={{ color: "red" }}
            >
              Delete
            </button>
            <button onClick={() => generatePDFLabel(label)}>Download Label PDF</button>
            <button onClick={() => generateAllSocialPosts(label)}>Generate All Social Posts</button>
          </div>
        </div>
      ))}

      {/* Hidden Post Template */}
      <div
        ref={postRef}
        style={postTemplate}
      >
        <img id="postLogo" src={logoUrl} alt="Logo" style={{ width: 300, objectFit: "contain" }} />
        <h2 id="postGreeting" style={{ color: "#2563eb" }}>{greeting}</h2>
        <p id="postProductName" style={{ fontSize: 28, fontWeight: 600 }}>Product</p>
        <p id="postSKU">SKU</p>
        <p id="postSize">Size</p>
        <p id="postQuality">Quality</p>
        <p id="postPrice" style={{ fontSize: 24, fontWeight: 500 }}>₹Price</p>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const brandSettings = {
  margin: "20px 0",
  border: "1px solid #ddd",
  padding: 10,
  borderRadius: 8,
};

const inputStyle = { width: "100%", margin: "5px 0", padding: 6 };

const labelCard = {
  border: "1px solid #ddd",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
};

const postTemplate = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: 1080,
  height: 1080,
  position: "absolute",
  left: -2000,
  padding: 50,
  gap: 20,
};
