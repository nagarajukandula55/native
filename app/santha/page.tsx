import SanthaPageClient from "./SanthaPageClient";
import { getMarketSessions } from "@/lib/an-sdk/santha";
import { getStoredPincodeServer } from "@/lib/pincodeServer";

/**
 * Server-fetches market sessions for a returning visitor's cookie-stored
 * pincode -- see app/fresh/page.tsx's identical comment for why.
 */
export default async function SanthaPage() {
  const pincode = await getStoredPincodeServer();

  let initialSessions: any[] = [];
  let initialSessionsError = "";

  if (pincode) {
    try {
      initialSessions = await getMarketSessions(pincode);
    } catch (err) {
      initialSessionsError = err instanceof Error ? err.message : "Could not load santha sessions";
    }
  }

  return (
    <SanthaPageClient
      initialPincode={pincode}
      initialSessions={initialSessions}
      initialSessionsError={initialSessionsError}
    />
  );
}
