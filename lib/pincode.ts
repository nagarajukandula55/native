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
  window.dispatchEvent(new CustomEvent(PINCODE_CHANGED_EVENT, { detail: pincode }));
}
