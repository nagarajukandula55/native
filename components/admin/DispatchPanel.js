"use client";

import { useState } from "react";

export default function DispatchPanel({ order }) {

  const [loading, setLoading] =
    useState(false);

  const [dispatchType, setDispatchType] =
    useState(
      order?.shipping?.dispatchType ||
      "COURIER"
    );

  const [courierId, setCourierId] =
    useState("");

  const [couriers, setCouriers] =
    useState([]);

  /* =========================================
     LOAD COURIERS
  ========================================= */

const loadCouriers = async () => {

  try {

    setLoading(true);

    const res = await fetch(
      "/api/shipping/couriers",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          orderId:
            order.orderId,
        }),
      }
    );

    const data =
      await res.json();

    if (data.success) {

      setCouriers(
        data.couriers || []
      );

    } else {

      alert(
        data.message
      );
    }

  } catch (err) {

    console.log(err);

    alert(
      "Failed loading couriers"
    );

  } finally {

    setLoading(false);
  }
};

  /* =========================================
     CREATE SHIPMENT
  ========================================= */

  const createShipment =
    async () => {

      try {

        setLoading(true);

        const res = await fetch(
          "/api/shipping/create-shipment",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              orderId:
                order.orderId,

              courierId,

              dispatchType,
            }),
          }
        );

        const data =
          await res.json();

        if (data.success) {

          alert(
            "Shipment Created ✅"
          );

          location.reload();

        } else {

          alert(
            data.message ||
            "Shipment failed"
          );
        }

      } catch (err) {

        console.log(err);

        alert(
          "Shipment creation failed"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div
      style={{
        border:
          "1px solid #e5e7eb",

        padding: 12,

        borderRadius: 10,

        marginTop: 10,

        background: "#fafafa",
      }}
    >

      <h4>
        🚚 Dispatch Panel
      </h4>

      {/* =====================================
         DISPATCH TYPE
      ===================================== */}

      <div
        style={{
          marginTop: 10,
        }}
      >

        <label>
          Dispatch Type
        </label>

        <select
          value={dispatchType}
          onChange={(e) =>
            setDispatchType(
              e.target.value
            )
          }
          style={select}
        >

          <option value="COURIER">
            Courier
          </option>

          <option value="BY_HAND">
            By Hand
          </option>

          <option value="LOCAL_DELIVERY">
            Local Delivery
          </option>

        </select>
      </div>

      {/* =====================================
         LOAD COURIERS
      ===================================== */}

      {dispatchType ===
        "COURIER" && (

        <>

          <button
            onClick={
              loadCouriers
            }
            style={btn("#2563eb")}
          >
            Load Couriers
          </button>

          {!!couriers.length && (

            <select
              value={courierId}
              onChange={(e) =>
                setCourierId(
                  e.target.value
                )
              }
              style={select}
            >

              <option value="">
                Select Courier
              </option>

              {couriers.map(
                (c) => (

                  <option
                    key={
                      c.courier_company_id
                    }
                    value={
                      c.courier_company_id
                    }
                  >

                    {c.courier_name}
                    {" - "}
                    ₹{c.rate}

                  </option>
                )
              )}

            </select>
          )}

        </>
      )}

      {/* =====================================
         ACTION
      ===================================== */}

      <button
        disabled={loading}
        onClick={
          createShipment
        }
        style={btn("#16a34a")}
      >

        {loading
          ? "Processing..."
          : "Create Shipment"}

      </button>

      {/* =====================================
         DOCS
      ===================================== */}

      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >

        <a
          href={`/invoice/${order.orderId}`}
          target="_blank"
        >
          📄 Invoice
        </a>

        <a
          href={`/receipt/${order.orderId}`}
          target="_blank"
        >
          🧾 Receipt
        </a>

        <a
          href={`/packing-slip/${order.orderId}`}
          target="_blank"
        >
          📦 Packing Slip
        </a>

        {order.shipping
          ?.labelUrl && (

          <a
            href={
              order.shipping
                .labelUrl
            }
            target="_blank"
          >
            🏷 Shipping Label
          </a>
        )}

      </div>

      {/* =====================================
         AWB
      ===================================== */}

      {order.shipping
        ?.awbNumber && (

        <div
          style={{
            marginTop: 10,
          }}
        >

          <b>
            AWB:
          </b>
          {" "}
          {
            order.shipping
              .awbNumber
          }

        </div>
      )}

    </div>
  );
}

/* =========================================
   STYLES
========================================= */

const select = {

  width: "100%",

  padding: 10,

  border:
    "1px solid #ddd",

  borderRadius: 8,

  marginTop: 8,

  marginBottom: 10,
};

const btn = (bg) => ({

  padding:
    "8px 12px",

  border: "none",

  borderRadius: 8,

  background: bg,

  color: "#fff",

  cursor: "pointer",

  fontWeight: 600,

  marginTop: 10,
});
