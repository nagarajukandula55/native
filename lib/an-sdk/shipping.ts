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
