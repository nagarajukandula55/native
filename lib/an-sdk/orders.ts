const API =
  process.env.NEXT_PUBLIC_AN_API ||
  "https://www.angroup.in";

/* =========================================
   GET ORDERS
========================================= */

export async function getOrders() {
  const res = await fetch(
    `${API}/api/orders/list`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

/* =========================================
   GET SINGLE ORDER
========================================= */

export async function getOrder(
  orderId: string
) {
  const res = await fetch(
    `${API}/api/orders/${orderId}`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

/* =========================================
   UPDATE STATUS
========================================= */

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  const res = await fetch(
    `${API}/api/admin/orders/update-status`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        orderId,
        status,
      }),
    }
  );

  return res.json();
}

/* =========================================
   MARK PAID
========================================= */

export async function markAsPaid(
  orderId: string,
  utr?: string
) {
  const res = await fetch(
    `${API}/api/payment/mark-paid`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        orderId,
        utr,
      }),
    }
  );

  return res.json();
}

/* =========================================
   ADD NOTE
========================================= */

export async function addOrderNote(
  orderId: string,
  note: string
) {
  const res = await fetch(
    `${API}/api/orders/add-note`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        orderId,
        note,
      }),
    }
  );

  return res.json();
}

/* =========================================
   GET TIMELINE
========================================= */

export async function getTimeline(
  orderId: string
) {
  const res = await fetch(
    `${API}/api/orders/timeline/${orderId}`
  );

  return res.json();
}
