"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import Modal from "./ui/Modal";
import { pincode as pincodeApi } from "@/lib/an-sdk";
import { getStoredPincode, setStoredPincode } from "@/lib/pincode";

/**
 * Delivery-pincode capture + indicator. Some categories (e.g. the phased
 * "Monthly Groceries" rollout) are only visible to customers in specific
 * pincodes -- previously the app only ever asked for a pincode at checkout,
 * so browsing/category tiles never reflected that filter until it was too
 * late. This shows a one-time prompt on first visit (if nothing is stored
 * yet) and a small "Deliver to ..." pill the customer can click anytime to
 * change it -- both read/write the same localStorage key checkout already
 * relies on (lib/pincode.ts) so there's a single source of truth.
 */
export default function PincodeBar() {
  const [pincode, setPincode] = useState("");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const stored = getStoredPincode();
    setPincode(stored);
    if (!stored) setOpen(true);
  }, []);

  const handleSave = async () => {
    if (!/^\d{6}$/.test(input)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }

    setChecking(true);
    setError("");

    try {
      // Best-effort validation against the same lookup checkout uses --
      // if it fails (network hiccup, unknown pincode) we still let the
      // customer proceed rather than blocking browsing on a third-party
      // lookup being available.
      const data = await pincodeApi.lookupPincode(input);
      if (data && data.success === false) {
        setError("We couldn't find that pincode. You can still continue.");
      }
    } catch {
      /* non-blocking */
    } finally {
      setChecking(false);
    }

    setStoredPincode(input);
    setPincode(input);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="pincodeBar"
        onClick={() => {
          setInput(pincode || "");
          setError("");
          setOpen(true);
        }}
        title="Change delivery pincode"
      >
        <MapPin size={14} />
        <span>{pincode ? `Deliver to ${pincode}` : "Set delivery pincode"}</span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Delivery Pincode">
        <p className="pincodeHint">
          Enter your pincode so we can show you what's available in your area.
        </p>
        <input
          className="pincodeInput"
          value={input}
          maxLength={6}
          inputMode="numeric"
          placeholder="e.g. 500081"
          onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        {error && <p className="pincodeError">{error}</p>}
        <button className="pincodeSaveBtn" onClick={handleSave} disabled={checking}>
          {checking ? "Checking..." : "Save"}
        </button>
      </Modal>

      <style jsx>{`
        .pincodeBar {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid #eee;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 13px;
          color: #333;
        }
        .pincodeBar:hover {
          background: #faf5ec;
        }
        .pincodeHint {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 12px;
        }
        .pincodeInput {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #dbe2ea;
          font-size: 15px;
          margin-bottom: 8px;
        }
        .pincodeError {
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .pincodeSaveBtn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: #1f3d2b;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
        }
        .pincodeSaveBtn:disabled {
          opacity: 0.7;
          cursor: default;
        }
      `}</style>
    </>
  );
}
