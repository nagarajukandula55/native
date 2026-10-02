import { anGet, anPost, anDelete } from "./client";

/**
 * A logged-in customer's saved delivery addresses -- backed by ANgroup's
 * GET/POST/DELETE /api/customer/addresses (User.addresses, see
 * src/models/User.ts on the ANgroup side). Authenticated only; guests never
 * call these (see checkout/page.tsx, which only fetches this list when
 * isLoggedIn()).
 */
export interface SavedAddress {
  _id: string;
  label?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  isDefault?: boolean;
  // GPS fix captured via "Use my current location" when this address was
  // saved -- optional, lets order alerts offer a one-tap navigation link.
  lat?: number;
  lng?: number;
  // "This is a business purchase (I have a GSTIN)" toggle -- see
  // lib/an-sdk/orderAddress.ts's OrderAddressInput for the full rationale.
  gstNumber?: string;
  isBusinessPurchase?: boolean;
}

export async function getSavedAddresses(): Promise<SavedAddress[]> {
  const data = await anGet("/api/customer/addresses");
  return data?.addresses || [];
}

export async function addSavedAddress(
  address: Omit<SavedAddress, "_id">
): Promise<SavedAddress[]> {
  const data = await anPost("/api/customer/addresses", address);
  return data?.addresses || [];
}

export async function deleteSavedAddress(addressId: string): Promise<SavedAddress[]> {
  const data = await anDelete("/api/customer/addresses", { addressId });
  return data?.addresses || [];
}
