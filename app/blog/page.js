"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch("/api/blog/list")
      .then((res) => res.json())
      .then((data) => setBlogs(data.blogs || []));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Indian Food Blog</h1>

      <div style={{ display: "grid", gap: 20 }}>
        {blogs.map((b) => (
          <Link key={b._id} href={`/blog/${b.slug}`}>
            <div style={card}>
              <img src={b.image} style={{ width: "100%", height: 200, objectFit: "cover" }} />
              <h2>{b.title}</h2>
              <p>{b.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const card = {
  border: "1px solid #ddd",
  padding: 16,
  borderRadius: 12,
  cursor: "pointer",
};
