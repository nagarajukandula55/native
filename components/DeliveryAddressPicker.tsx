"use client";

import { useEffect, useState } from "react";
import {
  getSavedAddresses,
  addSavedAddress,
  SavedAddress,
} from "@/lib/an-sdk/addresses";
import type { OrderAddressInput } from "@/lib/an-sdk/orderAddress";

/**
 * Delivery address picker shared by Fresh/Live Market/Groceries/Santha
 * order pages -- these order types previously only collected a pincode,
 * with no actual street address reaching the order (angroup's
 * Fresh/LiveMarket/Grocery/SanthaOrder models now have an `address` field
 * specifically to fix that; see those models' comments). Lets a logged-in
 * customer pick a saved address or add a new one, with an optional GPS fix
 * ("Use my current location", browser Geolocation API -- no map SDK/API
 * key needed) so ops get a one-tap navigation link later.
 */
export default function DeliveryAddressPicker({
  onChange,
}: {
  onChange: (address: OrderAddressInput | null) => void;
}) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    isBusinessPurchase: false,
    gstNumber: "",
  });
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "locating" | "done" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    getSavedAddresses()
      .then((list) => {
        if (cancelled) return;
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) {
          setSelectedId(def._id);
          emitSelected(def);
        } else {
          setAdding(true);
        }
      })
      .catch(() => {
        if (!cancelled) setAdding(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emitSelected(a: SavedAddress) {
    onChange({
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      phone: a.phone,
      lat: a.lat,
      lng: a.lng,
      gstNumber: a.gstNumber,
      isBusinessPurchase: a.isBusinessPurchase,
    });
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    setAdding(false);
    const a = addresses.find((x) => x._id === id);
    if (a) emitSelected(a);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("done");
      },
      () => setGpsStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSaveNew() {
    setError("");
    if (!form.line1.trim()) {
      setError("Address line is required.");
      return;
    }
    if (form.isBusinessPurchase && !form.gstNumber.trim()) {
      setError("GST number is required for a business purchase.");
      return;
    }
    setSaving(true);
    try {
      const updated = await addSavedAddress({
        label: form.label || "Home",
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        phone: form.phone.trim() || undefined,
        lat: gps?.lat,
        lng: gps?.lng,
        gstNumber: form.isBusinessPurchase ? form.gstNumber.trim() : undefined,
        isBusinessPurchase: form.isBusinessPurchase,
      } as any);
      setAddresses(updated);
      const saved = updated.find(
        (a) => a.line1 === form.line1.trim() && a.pincode === (form.pincode.trim() || undefined)
      ) || updated[updated.length - 1];
      if (saved) {
        setSelectedId(saved._id);
        emitSelected(saved);
      }
      setAdding(false);
    } catch {
      setError("Could not save address. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Loading your addresses…</p>;

  return (
    <div className="picker">
      {!!addresses.length && (
        <div className="savedList">
          {addresses.map((a) => (
            <button
              type="button"
              key={a._id}
              className={`addrCard ${selectedId === a._id && !adding ? "selected" : ""}`}
              onClick={() => handleSelect(a._id)}
            >
              <p className="addrLabel">{a.label || "Address"}{a.isDefault ? " · Default" : ""}</p>
              <p className="addrLine">
                {[a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(", ")}
              </p>
              {a.phone && <p className="addrPhone">{a.phone}</p>}
              {typeof a.lat === "number" && <p className="addrGps">📍 Exact location saved</p>}
              {a.isBusinessPurchase && <p className="addrGps">🧾 Business purchase (GST: {a.gstNumber})</p>}
            </button>
          ))}
        </div>
      )}

      {!adding ? (
        <button type="button" className="addNewBtn" onClick={() => setAdding(true)}>
          + Add a new address
        </button>
      ) : (
        <div className="newForm">
          <div className="row2">
            <input
              placeholder="Label (Home, Work…)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <input
            placeholder="House/flat no., street *"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
          />
          <input
            placeholder="Landmark, area (optional)"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
          />
          <div className="row3">
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
          </div>

          <label className="bizToggle">
            <input
              type="checkbox"
              checked={form.isBusinessPurchase}
              onChange={(e) => setForm({ ...form, isBusinessPurchase: e.target.checked })}
            />
            This is a business purchase (I have a GSTIN)
          </label>
          {form.isBusinessPurchase && (
            <input
              placeholder="GSTIN *"
              value={form.gstNumber}
              onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
            />
          )}

          <button type="button" className="gpsBtn" onClick={useCurrentLocation} disabled={gpsStatus === "locating"}>
            {gpsStatus === "done"
              ? "📍 Exact location captured"
              : gpsStatus === "locating"
              ? "Locating…"
              : "📍 Use my current location"}
          </button>
          {gpsStatus === "error" && (
            <p className="gpsError">Couldn&apos;t get your location — you can still save the address without it.</p>
          )}

          {error && <p className="formError">{error}</p>}

          <div className="formActions">
            {!!addresses.length && (
              <button type="button" className="cancelBtn" onClick={() => setAdding(false)}>
                Cancel
              </button>
            )}
            <button type="button" className="saveBtn" onClick={handleSaveNew} disabled={saving}>
              {saving ? "Saving…" : "Save & use this address"}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .picker {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .muted {
          color: #888;
        }
        .savedList {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 10px;
        }
        .addrCard {
          text-align: left;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 12px 14px;
          background: #fafafa;
          cursor: pointer;
        }
        .addrCard.selected {
          border-color: #c28b45;
          background: #fff7ec;
        }
        .addrLabel {
          font-weight: 600;
          margin: 0 0 4px;
          font-size: 13px;
        }
        .addrLine {
          margin: 0;
          font-size: 12px;
          color: #555;
        }
        .addrPhone,
        .addrGps {
          margin: 4px 0 0;
          font-size: 12px;
          color: #777;
        }
        .addNewBtn {
          align-self: flex-start;
          background: none;
          border: 1px dashed #c28b45;
          color: #c28b45;
          border-radius: 8px;
          padding: 8px 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .newForm {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 14px;
          background: #fafafa;
        }
        .row2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .row3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }
        input {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        .bizToggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #333;
          cursor: pointer;
        }
        .gpsBtn {
          align-self: flex-start;
          background: #eef6ec;
          color: #1f3d2b;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .gpsBtn:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .gpsError,
        .formError {
          color: #e11d48;
          font-size: 12px;
          margin: 0;
        }
        .formActions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .cancelBtn {
          background: none;
          border: 1px solid #ddd;
          border-radius: 30px;
          padding: 8px 18px;
          cursor: pointer;
        }
        .saveBtn {
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 30px;
          padding: 8px 20px;
          font-weight: 700;
          cursor: pointer;
        }
        .saveBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
