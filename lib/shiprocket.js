const BASE_URL =
  "https://apiv2.shiprocket.in/v1/external";

/* =========================================
   GET TOKEN
========================================= */

export async function getShiprocketToken() {

  try {

    /* ================= CACHE ================= */

    if (
      SHIPROCKET_TOKEN &&
      Date.now() < TOKEN_EXPIRES
    ) {

      return SHIPROCKET_TOKEN;
    }

    const response = await fetch(
      `${BASE_URL}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          email:
            process.env
              .SHIPROCKET_EMAIL,

          password:
            process.env
              .SHIPROCKET_PASSWORD,
        }),
      }
    );

    const data =
      await response.json();

    if (!data?.token) {

      throw new Error(
        data?.message ||
        "Shiprocket auth failed"
      );
    }

    /* ================= SAVE CACHE ================= */

    SHIPROCKET_TOKEN =
      data.token;

    TOKEN_EXPIRES =
      Date.now() +
      1000 * 60 * 60 * 8;

    return SHIPROCKET_TOKEN;

  } catch (err) {

    console.log(
      "SHIPROCKET TOKEN ERROR:",
      err
    );

    throw err;
  }
}

/* =========================================
   TOKEN CACHE
========================================= */

let SHIPROCKET_TOKEN = null;

let TOKEN_EXPIRES = 0;


/* =========================================
   CREATE SHIPMENT
========================================= */

export async function createShiprocketShipment(
  order
) {

  try {

    const token =
      await getShiprocketToken();

    const items =
      (order.items || []).map(
        (item) => ({

          name:
            item.name,

          sku:
            item.productKey ||
            item.name,

          units:
            item.qty || 1,

          selling_price:
            item.price || 0,

          discount: "",

          tax:
            item.gstPercent || 0,

          hsn:
            item.snapshot?.hsn ||
            "",
        })
      );

    const payload = {

      order_id:
        order.orderId,

      order_date:
        new Date(
          order.createdAt
        )
          .toISOString()
          .split("T")[0],

      pickup_location:
        process.env
          .SHIPROCKET_PICKUP_LOCATION,

      billing_customer_name:
        order.address?.name,

      billing_last_name:
        "",

      billing_address:
        order.address?.address,

      billing_city:
        order.address?.city,

      billing_pincode:
        order.address?.pincode,

      billing_state:
        order.address?.state,

      billing_country:
        "India",

      billing_email:
        order.address?.email,

      billing_phone:
        order.address?.phone,

      shipping_is_billing:
        true,

      order_items:
        items,

      payment_method:
        order.payment?.method ===
        "COD"
          ? "COD"
          : "Prepaid",

      shipping_charges: 0,

      giftwrap_charges: 0,

      transaction_charges: 0,

      total_discount: 0,

      sub_total:
        order.amount,

      length:
        order.shipping
          ?.dimensions
          ?.length || 10,

      breadth:
        order.shipping
          ?.dimensions
          ?.breadth || 10,

      height:
        order.shipping
          ?.dimensions
          ?.height || 10,

      weight:
        order.shipping
          ?.packageWeight || 0.5,
    };

    console.log(
      "🚚 SHIPROCKET PAYLOAD:",
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    const response = await fetch(
      `${BASE_URL}/orders/create/adhoc`,
      {

        method: "POST",

        headers: {

          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload
        ),
      }
    );

    const data =
      await response.json();

    console.log(
      "🚚 SHIPROCKET RESPONSE:",
      data
    );

    if (!response.ok) {

      throw new Error(
        data?.message ||
          "Shipment creation failed"
      );
    }

    return data;

  } catch (err) {

    console.log(
      "SHIPMENT CREATE ERROR:",
      err
    );

    throw err;
  }
}

/* =========================================
   GENERATE AWB
========================================= */

export async function assignAWB(
  shipmentId,
  courierId
) {

  const token =
    await getShiprocketToken();

  const response = await fetch(
    `${BASE_URL}/courier/assign/awb`,
    {

      method: "POST",

      headers: {

        Authorization:
          `Bearer ${token}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        shipment_id:
          shipmentId,

        courier_id:
          courierId,
      }),
    }
  );

  const data =
    await response.json();

  return data;
}

/* =========================================
   GENERATE LABEL
========================================= */

export async function generateLabel(
  shipmentId
) {

  const token =
    await getShiprocketToken();

  const response = await fetch(
    `${BASE_URL}/courier/generate/label`,
    {

      method: "POST",

      headers: {

        Authorization:
          `Bearer ${token}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        shipment_id: [
          shipmentId,
        ],
      }),
    }
  );

  return await response.json();
}

/* =========================================
   GENERATE INVOICE
========================================= */

export async function generateManifest(
  shipmentId
) {

  const token =
    await getShiprocketToken();

  const response = await fetch(
    `${BASE_URL}/manifests/generate`,
    {

      method: "POST",

      headers: {

        Authorization:
          `Bearer ${token}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        shipment_id: [
          shipmentId,
        ],
      }),
    }
  );

  return await response.json();
}

/* =========================================
   SCHEDULE PICKUP
========================================= */

export async function schedulePickup(
  shipmentId
) {

  const token =
    await getShiprocketToken();

  const response = await fetch(
    `${BASE_URL}/courier/generate/pickup`,
    {

      method: "POST",

      headers: {

        Authorization:
          `Bearer ${token}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        shipment_id: [
          shipmentId,
        ],
      }),
    }
  );

  return await response.json();
}

/* =========================================
   TRACK ORDER
========================================= */

export async function trackShipment(
  awb
) {

  const token =
    await getShiprocketToken();

  const response = await fetch(
    `${BASE_URL}/courier/track/awb/${awb}`,
    {

      headers: {

        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return await response.json();
}

/* =========================================
   GET COURIER SERVICES
========================================= */

export async function getCourierServices({
  pickup_postcode,
  delivery_postcode,
  cod = 0,
  weight = 0.5,
  declared_value = 1,
}) {

  try {

    const token =
      await getShiprocketToken();

    const url =
      `${BASE_URL}/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&cod=${cod}&weight=${weight}&declared_value=${declared_value}`;

    const response = await fetch(
      url,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const data =
      await response.json();

    console.log(
      "🚚 SERVICEABILITY:",
      data
    );

    return data;

  } catch (err) {

    console.log(
      "SERVICEABILITY ERROR:",
      err
    );

    throw err;
  }
}

/* =========================================
   TRACK BY SHIPMENT ID
========================================= */

export async function trackByShipmentId(
  shipmentId
) {

  try {

    const token =
      await getShiprocketToken();

    const response = await fetch(
      `${BASE_URL}/courier/track/shipment/${shipmentId}`,
      {

        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    return await response.json();

  } catch (err) {

    console.log(
      "TRACK SHIPMENT ERROR:",
      err
    );

    throw err;
  }
}

/* =========================================
   CANCEL SHIPMENT
========================================= */

export async function cancelShipment(
  awb
) {

  try {

    const token =
      await getShiprocketToken();

    const response = await fetch(
      `${BASE_URL}/orders/cancel/shipment`,
      {

        method: "POST",

        headers: {

          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          awbs: [awb],
        }),
      }
    );

    return await response.json();

  } catch (err) {

    console.log(
      "CANCEL SHIPMENT ERROR:",
      err
    );

    throw err;
  }
}

/* =========================================
   GENERATE MANIFEST PDF
========================================= */

export async function generateManifestPDF(
  shipmentId
) {

  try {

    const token =
      await getShiprocketToken();

    const response = await fetch(
      `${BASE_URL}/manifests/print`,
      {

        method: "POST",

        headers: {

          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          shipment_id: [
            shipmentId,
          ],
        }),
      }
    );

    return await response.json();

  } catch (err) {

    console.log(
      "MANIFEST PDF ERROR:",
      err
    );

    throw err;
  }
}
