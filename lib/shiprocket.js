let SHIPROCKET_TOKEN = null;

export async function authenticateShiprocket() {

  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    }
  );

  const data = await res.json();

  SHIPROCKET_TOKEN = data.token;

  return SHIPROCKET_TOKEN;
}

/* ================= CREATE SHIPMENT ================= */

export async function createShipment(payload) {

  if (!SHIPROCKET_TOKEN) {
    await authenticateShiprocket();
  }

  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SHIPROCKET_TOKEN}`,
      },

      body: JSON.stringify(payload),
    }
  );

  return res.json();
}
