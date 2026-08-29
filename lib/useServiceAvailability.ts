"use client";

/**
 * Shared availability check for the pincode-scoped Monthly Groceries /
 * Santha sections. A customer's stored pincode may simply not be served
 * yet (no shops for Monthly Groceries, no market sessions for Santha) --
 * in that case the nav links and the pages themselves should say so
 * clearly instead of sending the customer into an empty picker.
 *
 * Re-checks whenever the stored pincode changes (PINCODE_CHANGED_EVENT),
 * mirroring the exact pattern app/HomeClient.js uses to refetch categories
 * on pincode change.
 */
import { useEffect, useState } from "react";
import { getStoredPincode, PINCODE_CHANGED_EVENT } from "@/lib/pincode";
import { getShops, getMarketSessions } from "@/lib/an-sdk/groceries";

export type ServiceAvailability = {
  pincode: string;
  /** true/false once known, null while the pincode/coverage is still loading */
  groceriesAvailable: boolean | null;
  santhaAvailable: boolean | null;
};

export function useServiceAvailability(): ServiceAvailability {
  const [pincode, setPincode] = useState("");
  const [groceriesAvailable, setGroceriesAvailable] = useState<boolean | null>(null);
  const [santhaAvailable, setSanthaAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    setPincode(getStoredPincode());
    const onChange = (e: any) => setPincode(e.detail || getStoredPincode());
    window.addEventListener(PINCODE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(PINCODE_CHANGED_EVENT, onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!pincode) {
      setGroceriesAvailable(false);
      setSanthaAvailable(false);
      return;
    }

    setGroceriesAvailable(null);
    setSanthaAvailable(null);

    getShops(pincode)
      .then((list) => {
        if (!cancelled) setGroceriesAvailable(Array.isArray(list) && list.length > 0);
      })
      .catch(() => {
        if (!cancelled) setGroceriesAvailable(false);
      });

    getMarketSessions(pincode)
      .then((list) => {
        if (!cancelled) setSanthaAvailable(Array.isArray(list) && list.length > 0);
      })
      .catch(() => {
        if (!cancelled) setSanthaAvailable(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pincode]);

  return { pincode, groceriesAvailable, santhaAvailable };
}
