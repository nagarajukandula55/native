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
   CREATE SHIPMENT
========================================= */

export async function createShipment(
  orderId: string,
  dispatchType: string,
  courierId?: string
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
      }),
    }
  );

  return res.json();
}
