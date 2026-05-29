import { anFetch } from "./client";

export const getOrders = async () => {
  return anFetch("/api/orders/list");
};

export const markAsPaid = async (
  orderId: string,
  utr: string
) => {
  return anFetch(
    "/api/payment/mark-paid",
    {
      method: "POST",

      body: JSON.stringify({
        orderId,
        utr,
      }),
    }
  );
};

export const updateOrderStatus = async (
  orderId: string,
  status: string
) => {
  return anFetch(
    "/api/admin/orders/update-status",
    {
      method: "POST",

      body: JSON.stringify({
        orderId,
        status,
      }),
    }
  );
};
