"use client";

import { useEffect, useMemo, useState } from "react";
import { getFreshItems, FreshItem, FreshOrderItemInput } from "@/lib/an-sdk/fresh";

/**
 * Priced catalogue grid for Fresh -- unlike GroceryCatalogPicker,
 * this shows a REAL price per item (ratePerUnit) and a running cart
 * total, since Fresh is not a blind-quote flow (see
 * lib/an-sdk/fresh.ts's doc comment). Same tap-to-add stepper
 * interaction as GroceryCatalogPicker, extended with price display.
 */
export default function FreshCatalogPicker({
  shopId,
  onCartChange,
}: {
  shopId: string;
  onCartChange: (items: FreshOrderItemInput[], total: number) => void;
}) {
  const [items, setItems] = useState<FreshItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartQty, setCartQty] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setCartQty({});
    getFreshItems(shopId)
      .then((list) => {
        if (cancelled) return;
        setItems(list);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load today's rates.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [items]);

  const visible = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (cartQty[item._id] || 0) * item.ratePerUnit, 0),
    [items, cartQty]
  );

  useEffect(() => {
    const cartItems: FreshOrderItemInput[] = items
      .filter((i) => (cartQty[i._id] || 0) > 0)
      .map((i) => ({ itemId: i._id, name: i.name, quantity: cartQty[i._id], unit: i.unit }));
    onCartChange(cartItems, Math.round(total * 100) / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartQty, items]);

  function setQuantity(item: FreshItem, quantity: number) {
    setCartQty((prev) => ({ ...prev, [item._id]: quantity }));
  }

  if (loading) return <p>Loading today&apos;s rates…</p>;
  if (error) return <p className="warn">{error}</p>;
  if (!items.length) return <p className="warn">No items listed at this shop yet.</p>;

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
              <p className="rate">
                ₹{item.ratePerUnit}
                <span className="unit">/{item.unit}</span>
              </p>
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

      {total > 0 && (
        <div className="cartBar">
          <span>Cart total</span>
          <span className="cartTotal">₹{total.toFixed(2)}</span>
        </div>
      )}

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
        .rate {
          margin: 4px 0 0;
          font-size: 14px;
          font-weight: 700;
          color: #1f3d2b;
        }
        .rate .unit {
          font-weight: 500;
          font-size: 11px;
          color: #999;
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
        .cartBar {
          position: sticky;
          bottom: 0;
          margin-top: 16px;
          background: #1f3d2b;
          color: #fff;
          padding: 12px 16px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        .cartTotal {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
