import FreshPageClient from "./FreshPageClient";
import { getShops } from "@/lib/an-sdk/fresh";
import { getStoredPincodeServer } from "@/lib/pincodeServer";

/**
 * Shop list only depends on the customer's delivery pincode -- which, for
 * a RETURNING visitor, is already sitting in the pincode cookie (see
 * lib/pincode.ts's setStoredPincode / lib/pincodeServer.ts). Fetching it
 * here means a returning visitor's shop list is already in the initial
 * HTML instead of starting blank and fetching after hydration. A
 * first-time visitor has no cookie yet (pincode === ""), so this falls
 * through to empty initial props and FreshPageClient's existing client
 * fetch (keyed on the client-side localStorage pincode) takes over exactly
 * as before -- nothing about that path changes.
 */
export default async function FreshPage() {
  const pincode = await getStoredPincodeServer();

  let initialShops: any[] = [];
  let initialShopsError = "";

  if (pincode) {
    try {
      initialShops = await getShops(pincode);
    } catch (err) {
      initialShopsError = err instanceof Error ? err.message : "Could not load shops";
    }
  }

  return (
    <FreshPageClient
      initialPincode={pincode}
      initialShops={initialShops}
      initialShopsError={initialShopsError}
    />
  );
}
