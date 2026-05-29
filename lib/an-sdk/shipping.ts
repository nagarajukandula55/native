import { anFetch } from "./client";

export const loadShippingRates = async (
  orderId: string
) => {
  return anFetch(
    "/api/shipping/rates",
    {
      method: "POST",

      body: JSON.stringify({
        orderId,
      }),
    }
  );
};

export const createShipment = async (
  orderId: string,
  dispatchType: string,
  courierId?: string
) => {
  return anFetch(
    "/api/shipping/create-shipment",
    {
      method: "POST",

      body: JSON.stringify({
        orderId,
        dispatchType,
        courierId,
      }),
    }
  );
};
