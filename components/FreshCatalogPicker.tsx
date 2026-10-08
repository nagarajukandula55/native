"use client";

import { useEffect, useMemo, useState } from "react";
import { getFreshItems, FreshItem, FreshOrderItemInput, OperatingHoursStatus } from "@/lib/an-sdk/fresh";

/**
 * Priced catalogue grid for Fresh -- unlike GroceryCatalogPicker,
 * this shows a REAL price per item (displayRatePerUnit) and a running cart
 * total, since Fresh is not a blind-quote flow (see
 * lib/an-sdk/fresh.ts's doc comment). Same tap-to-add stepper
 * interaction as GroceryCatalogPicker, extended with price display,
 * Out of Stock handling, an optional cleaning/cutting add-on, and a
 * tap-to-view detail popup (full image + description).
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
  const [wantsCleaning, setWantsCleaning] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [detailItem, setDetailItem] = useState<FreshItem | null>(null);
  const [operatingHours, setOperatingHours] = useState<OperatingHoursStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setCartQty({});
    setWantsCleaning({});
    getFreshItems(shopId)
      .then(({ items: list, operatingHours: hours }) => {
        if (cancelled) return;
        setItems(list);
        setOperatingHours(hours);
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
    () =>
      items.reduce((sum, item) => {
        const qty = cartQty[item._id] || 0;
        if (qty <= 0) return sum;
        let lineTotal = qty * item.displayRatePerUnit;
        if (wantsCleaning[item._id] && item.offersCleaning && item.cleaningCharge) {
          lineTotal += qty * item.cleaningCharge;
        }
        return sum + lineTotal;
      }, 0),
    [items, cartQty, wantsCleaning]
  );

  useEffect(() => {
    const cartItems: FreshOrderItemInput[] = items
      .filter((i) => (cartQty[i._id] || 0) > 0)
      .map((i) => ({
        itemId: i._id,
        name: i.name,
        quantity: cartQty[i._id],
        unit: i.unit,
        wantsCleaning: i.offersCleaning ? !!wantsCleaning[i._id] : undefined,
      }));
    onCartChange(cartItems, Math.round(total * 100) / 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartQty, wantsCleaning, items]);

  function setQuantity(item: FreshItem, quantity: number) {
    if (!item.isActive || (operatingHours && !operatingHours.isOpen)) return;
    setCartQty((prev) => ({ ...prev, [item._id]: quantity }));
  }

  if (loading) return <p>Loading today&apos;s rates…</p>;
  if (error) return <p className="warn">{error}</p>;
  if (!items.length) return <p className="warn">No items listed at this shop yet.</p>;

  return (
    <div className="catalog">
      {operatingHours && !operatingHours.isOpen && (
        <p className="closedBanner">
          🕒 Closed right now — open daily {operatingHours.openTime} to {operatingHours.closeTime}. You can browse, but ordering is disabled until we reopen.
        </p>
      )}

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
          <div className={`itemCard ${!item.isActive ? "outOfStock" : ""}`} key={item._id}>
            <button type="button" className="thumb" onClick={() => setDetailItem(item)} aria-label={`View ${item.name} details`}>
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="thumbPlaceholder">{item.name.charAt(0).toUpperCase()}</div>
              )}
              {!item.isActive && <span className="oosBadge">Out of Stock</span>}
            </button>
            <div className="info">
              <button type="button" className="nameBtn" onClick={() => setDetailItem(item)}>
                {item.name}
              </button>
              <p className="rate">
                ₹{item.displayRatePerUnit}
                <span className="unit">/{item.unit}</span>
              </p>
            </div>
            <div className="pickRow">
              {!item.isActive ? (
                <button type="button" className="addBtn" disabled>
                  Out of Stock
                </button>
              ) : operatingHours && !operatingHours.isOpen ? (
                <button type="button" className="addBtn" disabled>
                  Closed
                </button>
              ) : cartQty[item._id] > 0 ? (
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
            {item.isActive && cartQty[item._id] > 0 && item.offersCleaning && !!item.cleaningCharge && (
              <div className="cleaningBlock">
                <label className="cleaningRow">
                  <input
                    type="checkbox"
                    checked={!!wantsCleaning[item._id]}
                    onChange={(e) => setWantsCleaning((prev) => ({ ...prev, [item._id]: e.target.checked }))}
                  />
                  Clean &amp; cut (+₹{item.cleaningCharge}/{item.unit})
                </label>
                {wantsCleaning[item._id] && (
                  <p className="cleaningNote">Note: cleaning removes waste (scales/gills/shell) -- the weight you receive will be a little less than what you ordered.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="cartBar">
          <span>Cart total</span>
          <span className="cartTotal">₹{total.toFixed(2)}</span>
        </div>
      )}

      {detailItem && (
        <div className="detailOverlay" onClick={() => setDetailItem(null)}>
          <div className="detailCard" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="closeBtn" onClick={() => setDetailItem(null)} aria-label="Close">
              ✕
            </button>
            <div className="detailImage">
              {detailItem.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={detailItem.imageUrl} alt={detailItem.name} />
              ) : (
                <div className="thumbPlaceholder">{detailItem.name.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <h3>{detailItem.name}</h3>
            {!detailItem.isActive && <p className="oosText">Out of Stock today</p>}
            <p className="detailRate">
              ₹{detailItem.displayRatePerUnit}
              <span className="unit">/{detailItem.unit}</span>
            </p>
            {detailItem.description && <p className="detailDesc">{detailItem.description}</p>}
            {detailItem.offersCleaning && !!detailItem.cleaningCharge && (
              <p className="detailCleaning">Cleaning &amp; cutting available (+₹{detailItem.cleaningCharge}/{detailItem.unit})</p>
            )}
          </div>
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
        .itemCard.outOfStock {
          opacity: 0.6;
        }
        .thumb {
          position: relative;
          width: 100%;
          height: 100px;
          background: #f0f0f0;
          border: none;
          padding: 0;
          cursor: pointer;
          display: block;
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .closedBanner {
          background: #fff3e0;
          border: 1px solid #ffcc80;
          color: #8a5a00;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 14px;
        }
        .oosBadge {
          position: absolute;
          top: 6px;
          left: 6px;
          background: rgba(0, 0, 0, 0.75);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 6px;
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
        .nameBtn {
          margin: 0;
          font-weight: 600;
          font-size: 13px;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          cursor: pointer;
          color: #222;
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
        .addBtn:disabled {
          border-color: #ccc;
          color: #999;
          cursor: not-allowed;
        }
        .cleaningBlock {
          padding: 0 10px 10px;
        }
        .cleaningRow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #555;
        }
        .cleaningNote {
          margin: 4px 0 0;
          font-size: 10px;
          color: #a15c00;
          background: #fff7e6;
          border-radius: 6px;
          padding: 5px 7px;
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
        .detailOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 300;
          padding: 16px;
        }
        .detailCard {
          position: relative;
          background: #fff;
          border-radius: 14px;
          max-width: 360px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          padding: 16px;
        }
        .closeBtn {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          z-index: 1;
        }
        .detailImage {
          width: 100%;
          height: 220px;
          border-radius: 10px;
          overflow: hidden;
          background: #f0f0f0;
          margin-bottom: 12px;
        }
        .detailImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .detailCard h3 {
          margin: 0 0 4px;
        }
        .oosText {
          color: #b91c1c;
          font-weight: 600;
          font-size: 13px;
          margin: 0 0 6px;
        }
        .detailRate {
          font-size: 18px;
          font-weight: 700;
          color: #1f3d2b;
          margin: 0 0 10px;
        }
        .detailDesc {
          font-size: 13px;
          color: #444;
          line-height: 1.5;
        }
        .detailCleaning {
          margin-top: 10px;
          font-size: 12px;
          color: #555;
          background: #f7f3ec;
          border-radius: 8px;
          padding: 8px 10px;
        }
      `}</style>
    </div>
  );
}
