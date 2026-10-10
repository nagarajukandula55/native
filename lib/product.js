// Shared "customer-facing product label" helper -- every place a customer
// sees a product name (home page, listing, detail, cart, checkout) should
// go through this rather than reading `p.name` directly, so a brand gets
// baked in consistently everywhere: "Native Dosa Mix", not just "Dosa Mix".
//
// Preference order:
//   1. `displayName` -- pre-combined "<Brand> <Name>" set server-side at
//      approval time (see native-admin's vendorProductApproval.service.ts
//      and ANgroup's storefront product routes). This is the source of
//      truth once present, so a later brand rename doesn't retroactively
//      change an already-approved product's label.
//   2. Compute from `brand` + `name` (+ variant value/unit if given) -- for
//      any product approved before `displayName` existed, or any caller
//      that only has the raw brand/name fields (e.g. a cart line item
//      before it's normalized). Avoids needing a backfill migration.
//   3. Bare `name` -- last resort when no brand info is available at all.
// Per-language field suffixes, matching the nameTe/nameKn/nameTa/nameMl/
// nameHi fields the other four catalogues (Live/Fresh/Santha/Groceries)
// already use -- see lib/language.ts's STATE_TO_LANGUAGE/localizedName.
const LANGUAGE_FIELD_SUFFIX = { te: "Te", kn: "Kn", ta: "Ta", ml: "Ml", hi: "Hi" };

export function getProductDisplayName(p, lang) {
  // A translated name takes priority over the precomposed `displayName`
  // (brand+name baked in server-side at approval time, English only) --
  // but only when one actually exists for this product/language; English
  // or an untranslated product falls through to the existing logic
  // unchanged, so nothing about today's behavior changes by default.
  const suffix = lang && LANGUAGE_FIELD_SUFFIX[lang];
  const localized = suffix && p?.[`name${suffix}`];
  if (localized) {
    const brand = p?.brand || "";
    return `${brand} ${localized}`.trim().replace(/\s+/g, " ");
  }

  if (p?.displayName) return p.displayName;

  const brand = p?.brand || "";
  const name = p?.name || "";

  const value = p?.primaryVariant?.value || "";
  const unit = p?.primaryVariant?.unit || "";

  return `${brand} ${name} ${value} ${unit}`.trim().replace(/\s+/g, " ");
}
