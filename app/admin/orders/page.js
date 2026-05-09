"use client";

import { useEffect, useState } from "react";

import OrderTimeline from "@/components/OrderTimeline";

export default function AdminOrdersPage() {

  const [orders, setOrders] =
    useState([]);

  const [filtered, setFiltered] =
    useState([]);

  const [status, setStatus] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================
     FETCH
  ========================================= */

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {

    try {

      setLoading(true);

      setError("");

      const res = await fetch(
        "/api/orders/list"
      );

      const data =
        await res.json();

      if (data?.success) {

        setOrders(
          data.orders || []
        );

        setFiltered(
          data.orders || []
        );

      } else {

        setOrders([]);

        setFiltered([]);
      }

    } catch (err) {

      console.error(err);

      setError(
        "Failed to load orders"
      );

    } finally {

      setLoading(false);
    }
  };

  /* =========================================
     FILTER
  ========================================= */

  useEffect(() => {

    let temp = [...orders];

    if (status !== "ALL") {

      temp = temp.filter(
        (o) =>
          o.status === status
      );
    }

    if (search) {

      temp = temp.filter(
        (o) =>

          o.orderId
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          o.address?.phone?.includes(
            search
          ) ||

          o.address?.name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }

    setFiltered(temp);

  }, [status, search, orders]);

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const updateStatus = async (
    id,
    newStatus
  ) => {

    try {

      const res = await fetch(
        "/api/admin/orders/update-status",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            id,

            status:
              newStatus,
          }),
        }
      );

      const data =
        await res.json();

      if (data?.success) {

        alert(
          "Status Updated ✅"
        );

        fetchOrders();

      } else {

        alert(
          data.message ||
          "Failed to update status"
        );
      }

    } catch (err) {

      console.error(err);

      alert(
        "Error updating status"
      );
    }
  };

  /* =========================================
     MARK PAID
  ========================================= */

  const markAsPaid = async (
    order
  ) => {

    const utr = prompt(
      "Enter UTR / Reference (optional)"
    );

    try {

      const res = await fetch(
        "/api/payment/mark-paid",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            orderId:
              order.orderId,

            utr,
          }),
        }
      );

      const data =
        await res.json();

      if (data.success) {

        alert(
          "Marked as Paid ✅"
        );

        fetchOrders();

      } else {

        alert(
          data.message ||
          "Failed ❌"
        );
      }

    } catch (err) {

      console.log(err);

      alert(
        "Payment update failed"
      );
    }
  };

  /* =========================================
     LOAD COURIERS
  ========================================= */

  const loadCouriers = async (
    order
  ) => {

    try {

      const res = await fetch(
        "/api/shipping/rates",
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

      console.log(
        "🚚 COURIERS:",
        data
      );

      if (!data.success) {

        alert(
          data.message ||
          "Failed to load couriers"
        );

        return;
      }

      if (
        !data.couriers?.length
      ) {

        alert(
          "No couriers available"
        );

        return;
      }

      let message =
        "Available Couriers:\n\n";

      data.couriers
        .slice(0, 10)
        .forEach((c) => {

          message +=

            `${c.courierId} - ${c.courierName}\n` +

            `₹${c.rate} | ETA: ${c.etd}\n\n`;
        });

      alert(message);

    } catch (err) {

      console.log(err);

      alert(
        "Courier fetch failed"
      );
    }
  };

  /* =========================================
     CREATE SHIPMENT
  ========================================= */

  const createShipment = async (
    order
  ) => {

    try {

      const dispatchType =
        document.getElementById(
          `dispatch-${order._id}`
        ).value;

      let courierId = null;

      if (
        dispatchType ===
        "COURIER"
      ) {

        courierId =
          prompt(
            "Enter Courier ID"
          );

        if (!courierId) {

          return;
        }
      }

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

      console.log(data);

      if (data.success) {

        alert(
          "Shipment Created ✅"
        );

        fetchOrders();

      } else {

        alert(
          data.message ||
          "Shipment Failed"
        );
      }

    } catch (err) {

      console.log(err);

      alert(
        "Shipment creation failed"
      );
    }
  };

  /* =========================================
     BUTTON STYLE
  ========================================= */

  const btn = (bg) => ({

    padding: "6px 10px",

    border: "none",

    borderRadius: 8,

    cursor: "pointer",

    fontSize: 12,

    fontWeight: 600,

    background: bg,

    color: "#fff",
  });

  /* =========================================
     ACTION BUTTONS
  ========================================= */

  const ActionButtons = ({
    o,
  }) => {

    return (

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >

        {/* MARK PAID */}
        {o.payment?.status !==
          "SUCCESS" && (

          <button
            style={btn("#16a34a")}
            onClick={() =>
              markAsPaid(o)
            }
          >
            Mark Paid
          </button>
        )}

        {/* PROCESSING */}
        {o.status === "PAID" && (

          <button
            style={btn("#2563eb")}
            onClick={() =>
              updateStatus(
                o._id,
                "PROCESSING"
              )
            }
          >
            Start Processing
          </button>
        )}

        {/* PACKED */}
        {o.status ===
          "PROCESSING" && (

          <button
            style={btn("#7c3aed")}
            onClick={() =>
              updateStatus(
                o._id,
                "PACKED"
              )
            }
          >
            Mark Packed
          </button>
        )}

        {/* DISPATCH */}
        {o.status === "PACKED" && (

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems:
                "center",
            }}
          >

            <select
              defaultValue="COURIER"
              id={`dispatch-${o._id}`}
              style={{
                padding: 8,
                borderRadius: 8,
              }}
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

            <button
              style={btn("#2563eb")}
              onClick={() =>
                loadCouriers(o)
              }
            >
              Load Couriers
            </button>

            <button
              style={btn("#f97316")}
              onClick={() =>
                createShipment(o)
              }
            >
              Dispatch
            </button>

          </div>
        )}

        {/* DELIVERED */}
        {o.status ===
          "DISPATCHED" && (

          <button
            style={btn("#111")}
            onClick={() =>
              updateStatus(
                o._id,
                "DELIVERED"
              )
            }
          >
            Delivered
          </button>
        )}

        {/* COMPLETE */}
        {o.status ===
          "DELIVERED" && (

          <span
            style={{

              padding:
                "4px 10px",

              borderRadius: 20,

              fontSize: 12,

              fontWeight: 600,

              background:
                "#dcfce7",
            }}
          >
            Completed ✔
          </span>
        )}

      </div>
    );
  };

  /* =========================================
     UI
  ========================================= */

  return (

    <div style={container}>

      {/* HEADER */}
      <div style={header}>

        <h2>
          📦 Orders Dashboard
        </h2>

        <input
          placeholder="Search Order ID / Phone / Customer"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={input}
        />

      </div>

      {error && (

        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}

      {/* FILTERS */}
      <div style={filters}>

        {[
          "ALL",
          "PENDING_PAYMENT",
          "PAID",
          "PROCESSING",
          "PACKED",
          "DISPATCHED",
          "DELIVERED",
        ].map((s) => (

          <button
            key={s}
            onClick={() =>
              setStatus(s)
            }
            style={{

              ...filterBtn,

              background:
                status === s
                  ? "#c28b45"
                  : "#eee",

              color:
                status === s
                  ? "#fff"
                  : "#000",
            }}
          >
            {s}
          </button>
        ))}

      </div>

      {/* TABLE */}
      {loading ? (

        <p>Loading...</p>

      ) : filtered.length === 0 ? (

        <p>No orders</p>

      ) : (

        <div style={table}>

          {/* HEADER */}
          <div style={rowHead}>

            <span>
              Order ID
            </span>

            <span>
              Customer
            </span>

            <span>
              Amount
            </span>

            <span>
              Payment
            </span>

            <span>
              Status
            </span>

            <span>
              Actions
            </span>

          </div>

          {/* ROWS */}
          {filtered.map((o) => (

            <div key={o._id}>

              <div style={row}>

                {/* ORDER */}
                <span>
                  {o.orderId}
                </span>

                {/* CUSTOMER */}
                <span>

                  {o.address?.name ||
                    "N/A"}

                  <br />

                  <small>
                    {o.address?.phone ||
                      "N/A"}
                  </small>

                </span>

                {/* AMOUNT */}
                <span>
                  ₹{o.amount}
                </span>

                {/* PAYMENT */}
                <span>

                  <b>
                    {o.payment
                      ?.status ||
                      "PENDING"}
                  </b>

                </span>

                {/* STATUS */}
                <span>

                  <b>
                    {o.status}
                  </b>

                </span>

                {/* ACTIONS */}
                <ActionButtons
                  o={o}
                />

              </div>

              {/* SHIPPING INFO */}
              {o.shipping
                ?.awbNumber && (

                <div
                  style={{

                    marginTop: 10,

                    padding: 10,

                    background:
                      "#f8fafc",

                    borderRadius: 10,
                  }}
                >

                  <div>

                    <b>
                      Courier:
                    </b>{" "}

                    {o.shipping
                      ?.courierPartner}

                  </div>

                  <div>

                    <b>
                      AWB:
                    </b>{" "}

                    {o.shipping
                      ?.awbNumber}

                  </div>

                  <div>

                    <b>
                      Status:
                    </b>{" "}

                    {o.shipping
                      ?.trackingStatus}

                  </div>

                  {o.shipping
                    ?.labelUrl && (

                    <div
                      style={{
                        marginTop: 6,
                      }}
                    >

                      <a
                        href={
                          o.shipping
                            .labelUrl
                        }
                        target="_blank"
                      >
                        Download Label
                      </a>

                    </div>
                  )}

                </div>
              )}

              {/* TIMELINE */}
              <div
                style={{
                  marginTop: 8,
                  marginBottom: 12,
                }}
              >

                <OrderTimeline
                  order={o}
                />

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

/* =========================================
   STYLES
========================================= */

const container = {

  padding: 20,

  maxWidth: 1400,

  margin: "auto",
};

const header = {

  display: "flex",

  justifyContent:
    "space-between",

  alignItems: "center",

  marginBottom: 20,

  gap: 10,
};

const input = {

  padding: 10,

  border:
    "1px solid #ddd",

  borderRadius: 8,

  minWidth: 260,
};

const filters = {

  display: "flex",

  gap: 10,

  marginBottom: 20,

  flexWrap: "wrap",
};

const filterBtn = {

  padding: "8px 12px",

  border: "none",

  borderRadius: 6,

  cursor: "pointer",
};

const table = {

  display: "flex",

  flexDirection: "column",

  gap: 10,
};

const rowHead = {

  display: "grid",

  gridTemplateColumns:
    "1fr 1fr 1fr 1fr 1fr 1.5fr",

  fontWeight: "bold",

  padding: 10,

  background: "#f5f5f5",

  borderRadius: 8,
};

const row = {

  display: "grid",

  gridTemplateColumns:
    "1fr 1fr 1fr 1fr 1fr 1.5fr",

  padding: 10,

  background: "#fff",

  border:
    "1px solid #eee",

  borderRadius: 8,

  alignItems: "center",

  gap: 10,
};
