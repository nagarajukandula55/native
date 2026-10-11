/**
 * Client-side storage for the customer's delivery pincode, shared by every
 * page that needs pincode-aware browsing (home/category listing) as well as
 * checkout. Single source of truth so we don't end up with two different
 * "pincode" values disagreeing with each other across the app.
 */

export const PINCODE_STORAGE_KEY = "native_delivery_pincode";

// Fired on window whenever the stored pincode changes, so any already-
// mounted component (e.g. HomeClient's category fetch) can react without
// needing a shared React context.
export const PINCODE_CHANGED_EVENT = "native:pincode-changed";

export function getStoredPincode(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(PINCODE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Resolves the device's current GPS position to a 6-digit Indian pincode
 * via reverse geocoding (OpenStreetMap Nominatim -- free, no API key).
 * Used by the "Use my current location" option so a customer doesn't have
 * to know/type their own pincode; this only ever reads one-shot location,
 * never tracks it continuously.
 */
export async function detectPincodeFromLocation(): Promise<string> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("Location isn't available on this device.");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });

  const { latitude, longitude } = position.coords;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error("Could not determine your pincode from your location.");

  const data = await res.json();
  const postcode = data?.address?.postcode;
  if (!postcode || !/^\d{6}$/.test(postcode)) {
    throw new Error("Could not determine your pincode from your location.");
  }
  return postcode;
}

export function setStoredPincode(pincode: string) {
  if (typeof window === "undefined") return;
  try {
    if (pincode) {
      localStorage.setItem(PINCODE_STORAGE_KEY, pincode);
    } else {
      localStorage.removeItem(PINCODE_STORAGE_KEY);
    }
  } catch {
    /* ignore (private browsing, etc.) */
  }
  // Mirror into a cookie alongside localStorage -- localStorage stays the
  // client-side source of truth (unchanged), but it's invisible to the
  // server. A cookie travels with every request, so a server component
  // (lib/pincodeServer.ts) can read the customer's last-known pincode on
  // the very first render of a pincode-gated page (vertical ordering pages,
  // home's category tiles) instead of that page always starting blank and
  // fetching only after the client mounts. 1 year expiry, matches how long
  // a delivery pincode choice is expected to stay relevant; SameSite=Lax
  // since this is only ever read, never used for anything auth-sensitive.
  try {
    if (pincode) {
      document.cookie = `${PINCODE_STORAGE_KEY}=${encodeURIComponent(pincode)}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      document.cookie = `${PINCODE_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(PINCODE_CHANGED_EVENT, { detail: pincode }));
}
