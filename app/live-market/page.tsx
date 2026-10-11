import LiveMarketPageClient from "./LiveMarketPageClient";
import { getShops } from "@/lib/an-sdk/liveMarket";
import { getStoredPincodeServer } from "@/lib/pincodeServer";

/**
 * Server-fetches the shop list for a returning visitor's cookie-stored
 * pincode -- see app/fresh/page.tsx's identical comment for why.
 */
export default async function LiveMarketPage() {
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
    <LiveMarketPageClient
      initialPincode={pincode}
      initialShops={initialShops}
      initialShopsError={initialShopsError}
    />
  );
}
