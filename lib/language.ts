/**
 * Client-safe language constants + storage. The actual pincode -> state
 * lookup (lib/pincodeState.ts) reads a 2.3MB CSV and must stay server-side
 * only; this file is what client components import.
 */

export type LanguageCode = "en" | "te" | "kn" | "ta" | "ml" | "hi";

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  te: "Telugu",
  kn: "Kannada",
  ta: "Tamil",
  ml: "Malayalam",
  hi: "Hindi",
};

// Everything outside the four explicitly-mapped states defaults to Hindi,
// per the business decision this was built against -- not because Hindi is
// "the" national default, just the agreed fallback for "rest of India".
export const STATE_TO_LANGUAGE: Record<string, LanguageCode> = {
  "andhra pradesh": "te",
  "telangana": "te",
  "karnataka": "kn",
  "tamil nadu": "ta",
  "kerala": "ml",
};

export function languageForState(state: string | null | undefined): LanguageCode {
  if (!state) return "hi";
  return STATE_TO_LANGUAGE[state.trim().toLowerCase()] || "hi";
}

export const LANGUAGE_STORAGE_KEY = "native_display_language";
export const LANGUAGE_CHANGED_EVENT = "native:language-changed";

export function getStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  try {
    const v = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (v && v in LANGUAGE_LABELS) return v as LanguageCode;
  } catch {
    /* ignore */
  }
  return "en";
}

export function setStoredLanguage(lang: LanguageCode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    /* ignore (private browsing, etc.) */
  }
  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: lang }));
}

/**
 * React hook for client components -- current display language, reacting
 * live to PincodeBar changing it (same event-driven pattern as
 * lib/pincode.ts's getStoredPincode/PINCODE_CHANGED_EVENT).
 */
export function useDisplayLanguage(): LanguageCode {
  // Lazy require avoids making this whole file (imported by the
  // server-only pincode-state route too) depend on React at module scope.
  // getStoredLanguage() itself already no-ops safely during SSR (no
  // window), so the hooks below run unconditionally either way -- no
  // Rules-of-Hooks violation from branching on environment.
  const { useEffect, useState } = require("react") as typeof import("react");
  const [lang, setLang] = useState<LanguageCode>(getStoredLanguage);
  useEffect(() => {
    setLang(getStoredLanguage());
    const onChange = (e: any) => setLang(e.detail || getStoredLanguage());
    window.addEventListener(LANGUAGE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(LANGUAGE_CHANGED_EVENT, onChange);
  }, []);
  return lang;
}

/**
 * Picks the right localized field off a catalogue item, e.g.
 * localizedName(item, "te") reads item.nameTe, falling back to item.name
 * (English) whenever the item has no translation for that language, or the
 * resolved language is English itself.
 */
export function localizedName(
  item: { name: string; nameTe?: string; nameKn?: string; nameTa?: string; nameMl?: string; nameHi?: string },
  lang: LanguageCode
): string {
  const field = {
    en: undefined,
    te: item.nameTe,
    kn: item.nameKn,
    ta: item.nameTa,
    ml: item.nameMl,
    hi: item.nameHi,
  }[lang];
  return field?.trim() || item.name;
}
