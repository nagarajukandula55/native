"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBlogList } from "@/lib/an-sdk/blog";

/**
 * "Related Reads" — surfaces up to 3 blog posts on the product detail page.
 * ANgroup's /api/blog/list currently requires auth (confirmed: an
 * unauthenticated call returns {"error":"Unauthorized"}), so for a
 * logged-out shopper this will almost always come back empty — that's
 * rendered as a graceful skip (nothing shown) rather than a broken
 * section or fabricated posts. If posts are ever returned, they're
 * loosely matched against the current product's category, falling back
 * to the most recent posts.
 */
export default function RelatedReads({ category }) {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getBlogList();
        const all = data?.blogs || data?.data || [];
        if (cancelled) return;

        let picked = [];
        if (category) {
          picked = all.filter(
            (b) =>
              (b.category || "").toLowerCase() === String(category).toLowerCase() ||
              (b.tags || []).some(
                (t) => String(t).toLowerCase() === String(category).toLowerCase()
              )
          );
        }
        if (picked.length === 0) picked = all;

        setPosts(picked.slice(0, 3));
      } catch {
        // No blog content available (auth-gated or empty) — skip silently.
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (!loaded || posts.length === 0) return null;

  return (
    <section className="relatedReads">
      <h2>Related Reads</h2>
      <p className="sub">From Our Blog</p>

      <div className="grid">
        {posts.map((post) => (
          <Link
            key={post._id || post.id || post.slug}
            href={`/blog/${post.slug}`}
            className="card"
          >
            {post.image && <img src={post.image} alt={post.title} />}
            <div className="body">
              <h3>{post.title}</h3>
              {post.excerpt && <p>{post.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .relatedReads {
          max-width: 1200px;
          margin: 0 auto;
          padding: 50px 20px;
        }
        h2 {
          font-family: var(--font-heading, serif);
          color: #1f3d2b;
          text-align: center;
          margin-bottom: 4px;
        }
        .sub {
          text-align: center;
          color: #777;
          margin-bottom: 28px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #eee;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }
        .card img {
          width: 100%;
          height: 160px;
          object-fit: cover;
        }
        .body {
          padding: 14px;
        }
        .body h3 {
          margin: 0 0 6px;
          font-size: 15px;
          color: #222;
        }
        .body p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }
      `}</style>
    </section>
  );
}
