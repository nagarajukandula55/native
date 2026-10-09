"use client";

import { useEffect, useState } from "react";
import { MapPin, LocateFixed } from "lucide-react";
import Modal from "./ui/Modal";
import { pincode as pincodeApi } from "@/lib/an-sdk";
import { getStoredPincode, setStoredPincode, detectPincodeFromLocation } from "@/lib/pincode";
import { setStoredLanguage } from "@/lib/language";

/**
 * Resolves the customer's display language from their pincode (via
 * /api/pincode-state, which keeps the 2.3MB pincode dataset server-side)
 * and stores it -- non-blocking, best-effort, never blocks pincode save.
 */
async function resolveAndStoreLanguage(pincode) {
  try {
    const res = await fetch(`/api/pincode-state/${pincode}`);
    const data = await res.json();
    if (data?.language) setStoredLanguage(data.language);
  } catch {
    /* non-blocking -- falls back to whatever language was already stored */
  }
}

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
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const stored = getStoredPincode();
    setPincode(stored);
    if (!stored) setOpen(true);
    else resolveAndStoreLanguage(stored);
  }, []);

  const commitPincode = async (value) => {
    setChecking(true);
    setError("");

    try {
      // Best-effort validation against the same lookup checkout uses --
      // if it fails (network hiccup, unknown pincode) we still let the
      // customer proceed rather than blocking browsing on a third-party
      // lookup being available.
      const data = await pincodeApi.lookupPincode(value);
      if (data && data.success === false) {
        setError("We couldn't find that pincode. You can still continue.");
      }
    } catch {
      /* non-blocking */
    } finally {
      setChecking(false);
    }

    setStoredPincode(value);
    setPincode(value);
    setOpen(false);
    resolveAndStoreLanguage(value);
  };

  const handleSave = async () => {
    if (!/^\d{6}$/.test(input)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }
    await commitPincode(input);
  };

  const handleUseLocation = async () => {
    setLocating(true);
    setError("");
    try {
      const detected = await detectPincodeFromLocation();
      setInput(detected);
      // Still goes through the same lookup/availability check as a typed
      // pincode -- if Native isn't live there yet, the category pages'
      // existing "not available in your area" messaging kicks in exactly
      // like it would for a manually typed pincode.
      await commitPincode(detected);
    } catch (err) {
      setError(err?.message || "Couldn't get your location. You can enter your pincode manually.");
    } finally {
      setLocating(false);
    }
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
        <button
          type="button"
          className="useLocationBtn"
          onClick={handleUseLocation}
          disabled={locating || checking}
        >
          <LocateFixed size={14} />
          {locating ? "Detecting your location..." : "Use my current location"}
        </button>
        <div className="orDivider">or enter manually</div>
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
        <button className="pincodeSaveBtn" onClick={handleSave} disabled={checking || locating}>
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
          white-space: nowrap;
          flex-shrink: 0;
        }
        .pincodeBar:hover {
          background: #faf5ec;
        }
        @media (max-width: 640px) {
          .pincodeBar {
            padding: 6px 8px;
            font-size: 12px;
            max-width: 110px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        .pincodeHint {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 12px;
        }
        .useLocationBtn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: 1px solid #1f3d2b;
          border-radius: 10px;
          background: #eef6ec;
          color: #1f3d2b;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 10px;
        }
        .useLocationBtn:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .orDivider {
          text-align: center;
          font-size: 12px;
          color: #9aa5b1;
          margin-bottom: 10px;
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
