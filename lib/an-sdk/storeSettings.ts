import { anGet } from "./client";
import {
  MIN_ORDER_VALUE,
  FREE_SHIPPING_THRESHOLD,
  SMALL_CART_FEE,
  DELIVERY_CHARGE,
} from "../constants";

export type StoreSettings = {
  minOrderValue: number;
  freeShippingThreshold: number;
  smallCartFee: number;
  deliveryCharge: number;
};

const FALLBACK_SETTINGS: StoreSettings = {
  minOrderValue: MIN_ORDER_VALUE,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  smallCartFee: SMALL_CART_FEE,
  deliveryCharge: DELIVERY_CHARGE,
};

/**
 * Public, unauthenticated storefront settings — mirrors the convention
 * used by getBanners() (see lib/an-sdk/banners.ts): businessId-scoped,
 * no auth required, safe to call from the cart/checkout pages.
 *
 * Expected shape: { success: true, settings: { minOrderValue,
 * freeShippingThreshold, smallCartFee, deliveryCharge } }. Any failure
 * falls back to the current lib/constants.ts values so cart/checkout
 * pricing never breaks or flashes $0 if this call fails.
 */
export async function getStoreSettings(): Promise<{
  success: boolean;
  settings: StoreSettings;
}> {
  try {
    const data = await anGet(`/api/store-settings`);
    const settings = data?.settings || {};
    return {
      success: true,
      settings: {
        minOrderValue:
          typeof settings.minOrderValue === "number"
            ? settings.minOrderValue
            : FALLBACK_SETTINGS.minOrderValue,
        freeShippingThreshold:
          typeof settings.freeShippingThreshold === "number"
            ? settings.freeShippingThreshold
            : FALLBACK_SETTINGS.freeShippingThreshold,
        smallCartFee:
          typeof settings.smallCartFee === "number"
            ? settings.smallCartFee
            : FALLBACK_SETTINGS.smallCartFee,
        deliveryCharge:
          typeof settings.deliveryCharge === "number"
            ? settings.deliveryCharge
            : FALLBACK_SETTINGS.deliveryCharge,
      },
    };
  } catch (err) {
    console.error("Store settings fetch error:", err);
    return { success: false, settings: FALLBACK_SETTINGS };
  }
}
