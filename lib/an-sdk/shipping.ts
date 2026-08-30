const API =
  process.env.NEXT_PUBLIC_AN_API ||
  "https://www.angroup.in";

/* =========================================
   LOAD COURIERS
========================================= */

export async function loadShippingRates(
  orderId: string
) {
  const res = await fetch(
    `${API}/api/shipping/rates`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        orderId,
      }),
    }
  );

  return res.json();
}

/* =========================================
   LIST AVAILABLE COURIERS
   Matches ANgroup's /api/shipping/couriers.
========================================= */

export async function getCouriers(payload: { orderId: string }) {
  const res = await fetch(`${API}/api/shipping/couriers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}

/**
 * NOTE: ANgroup has no dedicated pickup-request route today (see
 * ANGROUP_INTEGRATION_STATUS.md / FRONTEND_GAPS.md) — wiring this to the
 * closest plausible path so it fails soft (404) rather than throwing a
 * build/runtime error, until AN group adds a real route.
 */
export async function requestPickup(orderId: string) {
  const res = await fetch(`${API}/api/shipping/request-pickup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });

  return res.json();
}

/**
 * Live tracking sync by AWB number — matches ANgroup's
 * /api/shipping/track/:awb route.
 */
export async function syncTracking(awb: string) {
  const res = await fetch(`${API}/api/shipping/track/${encodeURIComponent(awb)}`);
  return res.json();
}

/* =========================================
   CREATE SHIPMENT
========================================= */

interface PackageData {
  weight: number;
  length: number;
  width: number;
  height: number;
}

export async function createShipment(
  orderId: string,
  dispatchType: string,
  courierId?: string,
  packageData: PackageData = {
    weight: 0.5,
    length: 10,
    width: 10,
    height: 10,
  }
) {
  const res = await fetch(
    `${API}/api/shipping/create-shipment`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        orderId,
        dispatchType,
        courierId,
      
        weight:
          (packageData as any).weight,
      
        length:
          (packageData as any).length,
      
        width:
          (packageData as any).width,
      
        height:
          (packageData as any).height,
      }),
    }
  );

  return res.json();
}

/* =========================================
   LOGISTICS OVERVIEW (admin Orders "Logistics" tab)
   Goes through this app's own /api/admin/logistics proxy (service-key
   auth) rather than calling ANgroup's /api/logistics/overview directly --
   that route requires either a real ANgroup session or the server-only
   ADMIN_SERVICE_KEY header, same as adminListOrders in orders.ts.
========================================= */

export async function adminLogisticsOverview() {
  const res = await fetch("/api/admin/logistics", { cache: "no-store" });
  return res.json();
}
