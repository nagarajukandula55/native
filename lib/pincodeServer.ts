import { cookies } from "next/headers";
import { PINCODE_STORAGE_KEY } from "./pincode";

/**
 * Server-side read of the customer's delivery pincode cookie (see
 * lib/pincode.ts's setStoredPincode, which mirrors it there alongside
 * localStorage). Separate file from pincode.ts on purpose: that module is
 * imported by client components, and next/headers can only be imported in
 * a server context -- bundling it into pincode.ts would break every client
 * import of this constant/helpers.
 *
 * Returns "" (not null) for a first-time visitor with no cookie yet, same
 * contract as getStoredPincode() client-side, so callers can treat both
 * identically.
 */
export async function getStoredPincodeServer(): Promise<string> {
  try {
    const store = await cookies();
    return store.get(PINCODE_STORAGE_KEY)?.value || "";
  } catch {
    return "";
  }
}
