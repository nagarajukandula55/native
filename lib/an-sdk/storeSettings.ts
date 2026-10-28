import {
  MIN_ORDER_VALUE,
  SMALL_CART_FEE_THRESHOLD,
  DELIVERY_CHARGE_THRESHOLD,
  SMALL_CART_FEE,
  DELIVERY_CHARGE,
} from "../constants";

export type StoreSettings = {
  minOrderValue: number;
  smallCartFeeThreshold: number;
  deliveryChargeThreshold: number;
  smallCartFee: number;
  deliveryCharge: number;
  socialLinks?: { label: string; url: string }[];
};

const FALLBACK_SETTINGS: StoreSettings = {
  minOrderValue: MIN_ORDER_VALUE,
  smallCartFeeThreshold: SMALL_CART_FEE_THRESHOLD,
  deliveryChargeThreshold: DELIVERY_CHARGE_THRESHOLD,
  smallCartFee: SMALL_CART_FEE,
  deliveryCharge: DELIVERY_CHARGE,
};

/**
 * Read the same Native Admin StoreSettings used by backend order pricing,
 * through our same-origin public proxy. Fallbacks are display estimates;
 * success:false prevents checkout until the live settings can be loaded.
 */
export async function getStoreSettings(): Promise<{
  success: boolean;
  settings: StoreSettings;
}> {
  try {
    const response = await fetch("/api/store-settings", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load checkout settings");
    const data = await response.json();
    const settings = data?.data;
    if (!data.success || !settings || Object.keys(FALLBACK_SETTINGS).some((key) =>
      typeof settings[key] !== "number" || !Number.isFinite(settings[key]) || settings[key] < 0)) {
      throw new Error("Invalid checkout settings");
    }
    return {
      success: true,
      settings: {
        minOrderValue:
          typeof settings.minOrderValue === "number"
            ? settings.minOrderValue
            : FALLBACK_SETTINGS.minOrderValue,
        smallCartFeeThreshold:
          typeof settings.smallCartFeeThreshold === "number"
            ? settings.smallCartFeeThreshold
            : FALLBACK_SETTINGS.smallCartFeeThreshold,
        deliveryChargeThreshold:
          typeof settings.deliveryChargeThreshold === "number"
            ? settings.deliveryChargeThreshold
            : FALLBACK_SETTINGS.deliveryChargeThreshold,
        smallCartFee:
          typeof settings.smallCartFee === "number"
            ? settings.smallCartFee
            : FALLBACK_SETTINGS.smallCartFee,
        deliveryCharge:
          typeof settings.deliveryCharge === "number"
            ? settings.deliveryCharge
            : FALLBACK_SETTINGS.deliveryCharge,
        socialLinks: Array.isArray(settings.socialLinks) ? settings.socialLinks : [],
      },
    };
  } catch (err) {
    console.error("Store settings fetch error:", err);
    return { success: false, settings: FALLBACK_SETTINGS };
  }
}
