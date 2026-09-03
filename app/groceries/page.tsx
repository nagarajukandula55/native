"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { getStoredPincode, PINCODE_CHANGED_EVENT } from "@/lib/pincode";
import { getShops, createGroceryOrder, GroceryOrderItemInput } from "@/lib/an-sdk/groceries";
import { ApiError } from "@/lib/an-sdk/client";
import GroceryCatalogPicker from "@/components/GroceryCatalogPicker";

type Row = GroceryOrderItemInput;

const emptyRow = (): Row => ({ name: "", quantity: 1, unit: "", notes: "" });

export default function MonthlyGroceriesPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [pincode, setPincode] = useState("");
  const [shops, setShops] = useState<any[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [shopsError, setShopsError] = useState("");
  const [selectedShopId, setSelectedShopId] = useState("");

  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setPincode(getStoredPincode());
    const onChange = (e: any) => setPincode(e.detail || getStoredPincode());
    window.addEventListener(PINCODE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(PINCODE_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setShopsLoading(true);
    setShopsError("");
    getShops(pincode)
      .then((list) => {
        if (cancelled) return;
        setShops(list);
        setSelectedShopId((prev) => (list.some((s: any) => s._id === prev) ? prev : list[0]?._id || ""));
      })
      .catch((err) => {
        if (cancelled) return;
        setShopsError(err instanceof ApiError ? err.message : "Could not load shops");
      })
      .finally(() => {
        if (!cancelled) setShopsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pincode]);

  const updateRow = (idx: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  // Catalog picks land in the same `rows` list, upserted by name (like a
  // real cart) — the picker now sends the item's new ABSOLUTE quantity on
  // every stepper +/- tap (not "add one more row per click"), including 0
  // to remove it. The existing free-text rows still double as the review
  // list for catalog picks, so nothing about order submission changes.
  const addCatalogPick = (picked: Row) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.name.trim().toLowerCase() === picked.name.trim().toLowerCase());
      if (picked.quantity <= 0) {
        if (idx === -1) return prev;
        const next = prev.filter((_, i) => i !== idx);
        return next.length ? next : [emptyRow()];
      }
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: picked.quantity, unit: picked.unit };
        return next;
      }
      const blankIdx = prev.findIndex((r) => !r.name);
      if (blankIdx !== -1) {
        const next = [...prev];
        next[blankIdx] = picked;
        return next;
      }
      return [...prev, picked];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!user) {
      router.push("/login?next=/groceries");
      return;
    }
    if (!pincode) {
      setSubmitError("Please set your delivery pincode first (top bar).");
      return;
    }
    if (!selectedShopId) {
      setSubmitError("Please select a shop.");
      return;
    }
    const items = rows
      .map((r) => ({ ...r, name: r.name.trim() }))
      .filter((r) => r.name);
    if (!items.length) {
      setSubmitError("Add at least one item.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createGroceryOrder({
        type: "MONTHLY_GROCERY",
        customerId: user.id,
        pincode,
        shopId: selectedShopId,
        items,
      });
      router.push(`/groceries/orders/${order._id}`);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not submit order");
    } finally {
      setSubmitting(false);
    }
  };

  const notAvailable = !shopsLoading && !shopsError && (!pincode || !shops.length);

  return (
    <div className="container">
      <div className="headRow">
        <h1>Monthly Groceries</h1>
        <Link href="/groceries/orders" className="link">
          My Grocery Orders
        </Link>
      </div>
      <p className="sub">
        Order your monthly groceries from local shops — list what you need, get a real quote back,
        pay, and we deliver.
      </p>

      {notAvailable ? (
        <div className="comingSoon">
          <span className="comingSoonBadge">Coming soon to your area</span>
          <h2>How Monthly Groceries works</h2>
          <p>
            Tell us what's on your list, and a shop near you sends back a real quote — no
            guesswork on price. Approve it, pay, and we bring it straight to your door.
          </p>
          <p className="comingSoonNote">
            We'll be in your city soon! {pincode ? (
              <>We don't have a shop live in <strong>{pincode}</strong> just yet, but we're
              growing fast — check back soon or try another pincode.</>
            ) : (
              <>Set your delivery pincode (top bar) and we'll let you know the moment Monthly
              Groceries is live near you.</>
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="section">
            <h2>1. Choose a shop</h2>
            {shopsLoading && <p>Loading shops…</p>}
            {shopsError && <p className="error">{shopsError}</p>}
            {!!shops.length && (
              <div className="shopGrid">
                {shops.map((shop) => (
                  <button
                    type="button"
                    key={shop._id}
                    className={`shopCard ${selectedShopId === shop._id ? "selected" : ""}`}
                    onClick={() => setSelectedShopId(shop._id)}
                  >
                    <p className="shopName">{shop.name}</p>
                    {shop.address && <p className="shopAddr">{shop.address}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>

      <div className="section">
        <h2>2. Pick items from the catalogue</h2>
        <p className="catalogHint">
          Prices aren't shown — the shop visited by our executive will send back a real quote for
          exactly what you pick.
        </p>
        {selectedShopId ? (
          <GroceryCatalogPicker key={selectedShopId} type="GROCERY" shopId={selectedShopId} onAdd={addCatalogPick} />
        ) : (
          <p className="catalogHint">Choose a shop above to see its item catalogue.</p>
        )}
      </div>

      <form className="section" onSubmit={handleSubmit}>
        <h2>3. Review your list</h2>
        <p className="catalogHint">Not in the catalogue? Add it here.</p>
        <div className="items">
          {rows.map((row, idx) => (
            <div className="itemRow" key={idx}>
              <input
                placeholder="Item name"
                value={row.name}
                onChange={(e) => updateRow(idx, { name: e.target.value })}
                className="itemName"
              />
              <input
                type="number"
                min={0}
                step="any"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(idx, { quantity: Number(e.target.value) })}
                className="itemQty"
              />
              <input
                placeholder="Unit (kg, pcs...)"
                value={row.unit}
                onChange={(e) => updateRow(idx, { unit: e.target.value })}
                className="itemUnit"
              />
              <input
                placeholder="Notes (optional)"
                value={row.notes}
                onChange={(e) => updateRow(idx, { notes: e.target.value })}
                className="itemNotes"
              />
              <button
                type="button"
                className="removeBtn"
                onClick={() => removeRow(idx)}
                disabled={rows.length === 1}
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="addBtn" onClick={addRow}>
          + Add item
        </button>

        {submitError && <p className="error">{submitError}</p>}

        <button type="submit" className="submitBtn" disabled={submitting || userLoading}>
          {submitting ? "Submitting…" : "Request Quote"}
        </button>
      </form>
        </>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .headRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .link {
          color: #c28b45;
          font-weight: 600;
          text-decoration: none;
        }
        .sub {
          color: #666;
          margin: 8px 0 24px;
        }
        .warn {
          background: #fff7e6;
          border: 1px solid #f0c36d;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .comingSoon {
          background: #fffdf8;
          border: 1px solid #f0e2c6;
          border-radius: 16px;
          padding: 36px 32px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.04);
        }
        .comingSoonBadge {
          display: inline-block;
          background: #eef6ec;
          color: #1f3d2b;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 14px;
        }
        .comingSoon h2 {
          margin: 0 0 12px;
          font-size: 20px;
          color: #1f3d2b;
        }
        .comingSoon p {
          max-width: 520px;
          margin: 0 auto 12px;
          color: #555;
          line-height: 1.6;
        }
        .comingSoonNote {
          font-weight: 600;
          color: #7c5a1e;
        }
        .section {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        h2 {
          margin: 0 0 14px;
          font-size: 16px;
        }
        .catalogHint {
          margin: -8px 0 14px;
          font-size: 12px;
          color: #999;
        }
        .shopGrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        .shopCard {
          text-align: left;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 12px 14px;
          background: #fafafa;
          cursor: pointer;
        }
        .shopCard.selected {
          border-color: #c28b45;
          background: #fff7ec;
        }
        .shopName {
          font-weight: 600;
          margin: 0 0 4px;
        }
        .shopAddr {
          margin: 0;
          font-size: 12px;
          color: #777;
        }
        .items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .itemRow {
          display: grid;
          grid-template-columns: 2fr 0.7fr 1fr 1.5fr auto;
          gap: 8px;
        }
        .itemRow input {
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        .removeBtn {
          border: none;
          background: #f4f4f4;
          border-radius: 8px;
          cursor: pointer;
        }
        .addBtn {
          border: 1px dashed #c28b45;
          background: none;
          color: #c28b45;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .error {
          color: #e11d48;
          margin-top: 12px;
        }
        .submitBtn {
          display: block;
          margin-top: 16px;
          padding: 12px 24px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-weight: 700;
          cursor: pointer;
        }
        .submitBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 640px) {
          .itemRow {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
