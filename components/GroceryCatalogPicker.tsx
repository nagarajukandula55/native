"use client";

import { useEffect, useMemo, useState } from "react";
import { getGroceryItems, GroceryItem, GroceryOrderItemInput } from "@/lib/an-sdk/groceries";

/**
 * Browsable catalogue grid for Monthly Groceries / Santha item picking.
 * Fetches GroceryItem catalog entries (image, name, description, unit --
 * deliberately NO price, see models/GroceryItem.ts) and lets the customer
 * pick a quantity per item. On "Add" it converts the pick into the same
 * {name, quantity, unit, notes} shape the order-creation API already
 * expects, via onAdd — no backend contract change.
 */
export default function GroceryCatalogPicker({
  type,
  onAdd,
}: {
  type: "GROCERY" | "SANTHA";
  onAdd: (item: GroceryOrderItemInput) => void;
}) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getGroceryItems(type)
      .then((list) => {
        if (cancelled) return;
        setItems(list);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load the item catalogue — you can still add items below.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [items]);

  const visible = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  function handleAdd(item: GroceryItem) {
    const quantity = qty[item._id] || 1;
    onAdd({ name: item.name, quantity, unit: item.unit, notes: "" });
    setAdded((prev) => ({ ...prev, [item._id]: true }));
    window.setTimeout(() => setAdded((prev) => ({ ...prev, [item._id]: false })), 1500);
  }

  if (loading) return <p>Loading catalogue…</p>;
  if (error) return <p className="warn">{error}</p>;
  if (!items.length) return null;

  return (
    <div className="catalog">
      {categories.length > 1 && (
        <div className="catTabs">
          {categories.map((c) => (
            <button
              type="button"
              key={c}
              className={`catTab ${activeCategory === c ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid">
        {visible.map((item) => (
          <div className="itemCard" key={item._id}>
            <div className="thumb">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="thumbPlaceholder">{item.name.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="info">
              <p className="name">{item.name}</p>
              {item.description && <p className="desc">{item.description}</p>}
              <p className="unit">Unit: {item.unit}</p>
            </div>
            <div className="pickRow">
              <input
                type="number"
                min={0.5}
                step="any"
                value={qty[item._id] ?? 1}
                onChange={(e) => setQty((prev) => ({ ...prev, [item._id]: Number(e.target.value) }))}
                className="qtyInput"
              />
              <button type="button" className="addBtn" onClick={() => handleAdd(item)}>
                {added[item._id] ? "Added ✓" : "+ Add"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .catalog {
          margin-bottom: 16px;
        }
        .warn {
          background: #fff7e6;
          border: 1px solid #f0c36d;
          padding: 10px 14px;
          border-radius: 8px;
        }
        .catTabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }
        .catTab {
          border: 1px solid #eee;
          background: #fafafa;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
        }
        .catTab.active {
          border-color: #c28b45;
          background: #fff7ec;
          color: #c28b45;
          font-weight: 600;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
        }
        .itemCard {
          border: 1px solid #eee;
          border-radius: 10px;
          overflow: hidden;
          background: #fafafa;
          display: flex;
          flex-direction: column;
        }
        .thumb {
          width: 100%;
          height: 100px;
          background: #f0f0f0;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .thumbPlaceholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 700;
          color: #c9a06b;
          background: #f3e6d3;
        }
        .info {
          padding: 8px 10px 0;
          flex: 1;
        }
        .name {
          margin: 0;
          font-weight: 600;
          font-size: 13px;
        }
        .desc {
          margin: 4px 0 0;
          font-size: 11px;
          color: #888;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .unit {
          margin: 4px 0 0;
          font-size: 11px;
          color: #aaa;
        }
        .pickRow {
          display: flex;
          gap: 6px;
          padding: 8px 10px 10px;
        }
        .qtyInput {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
        }
        .addBtn {
          white-space: nowrap;
          border: none;
          background: #c28b45;
          color: #fff;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
