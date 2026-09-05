"use client";

import { useEffect, useMemo, useState } from "react";
import { getGroceryItems, GroceryItem, GroceryOrderItemInput } from "@/lib/an-sdk/groceries";

/**
 * Browsable catalogue grid for Monthly Groceries / Santha item picking --
 * Zepto/Blinkit-style tap-to-add cards with a quantity stepper, not a
 * separate "type a number then click Add" step. Fetches GroceryItem
 * catalog entries (image, name, description, unit -- deliberately NO
 * price, see models/GroceryItem.ts) for the given shop (GROCERY only --
 * master list + that shop's own items, see getGroceryItems's doc comment)
 * or the flat Santha catalog. `onAdd` is called with the item's new
 * ABSOLUTE quantity (0 = removed) so the parent can upsert-by-name into
 * its own item list rather than appending a duplicate row per click.
 */
export default function GroceryCatalogPicker({
  type,
  shopId,
  onAdd,
  fetchItems,
}: {
  type: "GROCERY" | "SANTHA";
  shopId?: string;
  onAdd: (item: GroceryOrderItemInput) => void;
  /**
   * Optional override for how the catalogue is fetched. Santha's catalog
   * now lives on its own independent SanthaItem model/route
   * (/api/santha-items, see lib/an-sdk/santha.ts's getSanthaItems) rather
   * than the shared GroceryItem model this component defaults to -- pass
   * `() => getSanthaItems()` from app/santha/page.tsx instead of relying
   * on `type: "SANTHA"` hitting the old shared /api/grocery-items route.
   */
  fetchItems?: () => Promise<any[]>;
}) {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartQty, setCartQty] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    (fetchItems ? fetchItems() : getGroceryItems(type, undefined, shopId))
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
  }, [type, shopId, fetchItems]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [items]);

  const visible = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  function setQuantity(item: GroceryItem, quantity: number) {
    setCartQty((prev) => ({ ...prev, [item._id]: quantity }));
    onAdd({ name: item.name, quantity, unit: item.unit, notes: "" });
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
              {cartQty[item._id] > 0 ? (
                <div className="stepper">
                  <button type="button" className="stepBtn" onClick={() => setQuantity(item, Math.max(0, (cartQty[item._id] || 0) - 1))}>
                    −
                  </button>
                  <span className="stepQty">{cartQty[item._id]}</span>
                  <button type="button" className="stepBtn" onClick={() => setQuantity(item, (cartQty[item._id] || 0) + 1)}>
                    +
                  </button>
                </div>
              ) : (
                <button type="button" className="addBtn" onClick={() => setQuantity(item, 1)}>
                  + Add
                </button>
              )}
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
        .addBtn {
          width: 100%;
          white-space: nowrap;
          border: 1px solid #c28b45;
          background: #fff;
          color: #c28b45;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .stepper {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #c28b45;
          border-radius: 8px;
          overflow: hidden;
        }
        .stepBtn {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          width: 30px;
          height: 30px;
          cursor: pointer;
          line-height: 1;
        }
        .stepQty {
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          min-width: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
