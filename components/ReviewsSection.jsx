"use client";

import { useEffect, useState } from "react";
import {
  getReviews,
  getReviewSummary,
  submitReview,
} from "@/lib/an-sdk/reviews";

function Stars({ value = 0, size = 16, onSelect }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onSelect?.(n)}
          style={{
            fontSize: size,
            cursor: onSelect ? "pointer" : "default",
            color: n <= Math.round(value) ? "#f5a623" : "#ddd",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    rating: 5,
    title: "",
    body: "",
    authorName: "",
  });

  async function load() {
    if (!productId) return;
    setLoading(true);
    try {
      const [reviewData, summaryData] = await Promise.all([
        getReviews(productId),
        getReviewSummary(productId),
      ]);
      setReviews(reviewData?.reviews || []);
      setSummary({
        average: summaryData?.average || 0,
        count: summaryData?.count || 0,
      });
    } catch (err) {
      // Backend endpoint may not exist yet on the AN group side — fail quietly.
      setReviews([]);
      setSummary({ average: 0, count: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.body.trim() || !form.authorName.trim()) {
      setError("Please add your name and a short review.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitReview({ productId, ...form });
      setForm({ rating: 5, title: "", body: "", authorName: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err?.message || "Could not submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="reviews">
      <div className="header">
        <h2>Ratings & Reviews</h2>

        <div className="summary">
          <Stars value={summary.average} size={20} />
          <span className="avg">{summary.average?.toFixed(1) || "0.0"}</span>
          <span className="count">
            ({summary.count} {summary.count === 1 ? "review" : "reviews"})
          </span>
        </div>

        <button className="writeBtn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Your Rating
            <Stars
              value={form.rating}
              size={24}
              onSelect={(n) => setForm((f) => ({ ...f, rating: n }))}
            />
          </label>

          <input
            placeholder="Your name"
            value={form.authorName}
            onChange={(e) =>
              setForm((f) => ({ ...f, authorName: e.target.value }))
            }
          />

          <input
            placeholder="Review title (optional)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />

          <textarea
            placeholder="Share your experience with this product..."
            rows={4}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="muted">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="list">
          {reviews.map((r) => (
            <div className="item" key={r.id || r._id}>
              <div className="itemHead">
                <strong>{r.authorName}</strong>
                {r.verifiedPurchase && (
                  <span className="verified">Verified Purchase</span>
                )}
              </div>

              <Stars value={r.rating} size={14} />

              {r.title && <p className="title">{r.title}</p>}
              <p className="body">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .reviews {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        h2 {
          font-size: 22px;
          margin: 0;
        }

        .summary {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .avg {
          font-weight: 700;
        }

        .count {
          color: #777;
          font-size: 13px;
        }

        .writeBtn {
          margin-left: auto;
          padding: 10px 20px;
          border: none;
          border-radius: 30px;
          font-weight: 700;
          background: #c28b45;
          color: #fff;
          cursor: pointer;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 480px;
          margin-bottom: 30px;
          padding: 16px;
          border: 1px solid #eee;
          border-radius: 10px;
        }

        .form input,
        .form textarea {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font: inherit;
        }

        .form button {
          padding: 11px;
          border: none;
          border-radius: 30px;
          background: #1f3d2b;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }

        .form button:hover:not(:disabled) {
          background: #16301f;
        }

        .form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          color: #d33;
          font-size: 13px;
          margin: 0;
        }

        .muted {
          color: #777;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .item {
          border-bottom: 1px solid #eee;
          padding-bottom: 16px;
        }

        .itemHead {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .verified {
          font-size: 11px;
          color: green;
          background: #eaf7ea;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .title {
          font-weight: 600;
          margin: 6px 0 2px;
        }

        .body {
          color: #444;
          margin: 0;
        }
      `}</style>
    </section>
  );
}
