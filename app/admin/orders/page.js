"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getOrders,
  markAsPaid,
  updateOrderStatus,
} from "@/lib/an-sdk/orders";

import {
  loadShippingRates,
  createShipment,
} from "@/lib/an-sdk/shipping";

const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "PACKED",
  "DISPATCHED",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("ALL");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  /* =========================================
     HELPERS
  ========================================= */

  const getCustomerName = (o) =>
    o?.customer?.name ||
    o?.address?.name ||
    o?.user?.name ||
    "N/A";

  const getCustomerPhone = (o) =>
    o?.customer?.phone ||
    o?.address?.phone ||
    o?.user?.phone ||
    "N/A";

  const getLocation = (o) =>
    `${o?.address?.city || "-"}, ${
      o?.address?.state || "-"
    }`;

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return {
          background: "#fff7ed",
          color: "#ea580c",
          border: "1px solid #fdba74",
        };

      case "PAID":
        return {
          background: "#ecfdf5",
          color: "#059669",
          border: "1px solid #6ee7b7",
        };

      case "PROCESSING":
        return {
          background: "#eff6ff",
          color: "#2563eb",
          border: "1px solid #93c5fd",
        };

      case "PACKED":
        return {
          background: "#f5f3ff",
          color: "#7c3aed",
          border: "1px solid #c4b5fd",
        };

      case "DISPATCHED":
        return {
          background: "#fff7ed",
          color: "#ea580c",
          border: "1px solid #fdba74",
        };

      case "DELIVERED":
        return {
          background: "#ecfeff",
          color: "#0891b2",
          border: "1px solid #67e8f9",
        };

      case "FAILED":
        return {
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #fca5a5",
        };

      default:
        return {
          background: "#f4f4f5",
          color: "#52525b",
          border: "1px solid #d4d4d8",
        };
    }
  };

  /* =========================================
     FETCH
  ========================================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const data = await getOrders();

      if (data?.success) {
        setOrders(data.orders || []);

        if (
          !selectedOrder &&
          data.orders?.length
        ) {
          setSelectedOrder(
            data.orders[0]
          );
        }
      }
    } catch (err) {
      console.log(err);
      alert("Failed loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =========================================
     FILTER
  ========================================= */

  const filteredOrders = useMemo(() => {
    let temp = [...orders];

    if (status !== "ALL") {
      temp = temp.filter(
        (o) => o.status === status
      );
    }

    if (search) {
      temp = temp.filter(
        (o) =>
          o.orderId
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          getCustomerName(o)
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          getCustomerPhone(o).includes(
            search
          )
      );
    }

    return temp;
  }, [orders, search, status]);

  /* =========================================
     ACTIONS
  ========================================= */

  const handleMarkPaid = async (
    orderId
  ) => {
    const utr = prompt(
      "Enter UTR Number"
    );

    if (!utr) return;

    try {
      const data = await markAsPaid(
        orderId,
        utr
      );

      if (data.success) {
        fetchOrders();
        alert("Payment Updated");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleStatusUpdate = async (
    orderId,
    newStatus
  ) => {
    try {
      const data =
        await updateOrderStatus(
          orderId,
          newStatus
        );

      if (data.success) {
        fetchOrders();
        alert("Status Updated");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLoadCouriers = async (
    orderId
  ) => {
    try {
      const data =
        await loadShippingRates(
          orderId
        );

      console.log(data);

      if (!data.success) {
        return alert("Failed");
      }

      if (!data.couriers?.length) {
        return alert(
          "No couriers found"
        );
      }

      let txt = "";

      data.couriers
        .slice(0, 10)
        .forEach((c) => {
          txt += `
Courier: ${c.courierName}
Rate: ₹${c.rate}
ETA: ${c.etd}
Courier ID: ${c.courierId}

`;
        });

      alert(txt);
    } catch (err) {
      console.log(err);
    }
  };

  const handleShipment = async (
    orderId,
    dispatchType
  ) => {
    try {
      let courierId = "";

      if (dispatchType === "COURIER") {
        courierId =
          prompt("Enter Courier ID") ||
          "";

        if (!courierId) return;
      }

      const data =
        await createShipment(
          orderId,
          dispatchType,
          courierId
        );

      if (data.success) {
        fetchOrders();
        alert("Shipment Created");
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================================
     STATS
  ========================================= */

  const revenue = orders.reduce(
    (sum, o) => sum + (o.amount || 0),
    0
  );

  return (
    <div
      style={{
        padding: 24,
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 700,
              margin: 0,
              color: "#111827",
            }}
          >
            Orders Management
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: 8,
            }}
          >
            Native Commerce Operations
          </p>
        </div>

        <button
          onClick={fetchOrders}
          style={{
            height: 46,
            padding:
              "0px 20px",
            borderRadius: 12,
            border: "none",
            background: "#111827",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Refresh Orders
        </button>
      </div>

      {/* KPI */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            title: "Total Orders",
            value: orders.length,
          },

          {
            title: "Revenue",
            value: `₹${revenue}`,
          },

          {
            title: "Paid Orders",
            value: orders.filter(
              (o) =>
                o.payment?.status ===
                "PAID"
            ).length,
          },

          {
            title: "Dispatched",
            value: orders.filter(
              (o) =>
                o.status ===
                "DISPATCHED"
            ).length,
          },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 20,
              border:
                "1px solid #e5e7eb",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.04)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              {item.title}
            </p>

            <h2
              style={{
                marginTop: 12,
                marginBottom: 0,
                fontSize: 32,
                color: "#111827",
              }}
            >
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* MAIN */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0,1fr) 420px",
            gap: 20,
            height: "calc(100vh - 220px)",
            overflow: "hidden",
          }}
        >
        {/* LEFT */}

        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            border:
              "1px solid #e5e7eb",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* TOOLBAR */}

          <div
            style={{
              padding: 18,
              borderBottom:
                "1px solid #e5e7eb",
              display: "flex",
              gap: 14,
            }}
          >
            <input
              placeholder="Search orders..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                border:
                  "1px solid #d1d5db",
                padding:
                  "0px 14px",
                outline: "none",
                fontSize: 14,
              }}
            />

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              style={{
                width: 220,
                borderRadius: 12,
                border:
                  "1px solid #d1d5db",
                padding:
                  "0px 14px",
              }}
            >
              <option value="ALL">
                All Orders
              </option>

              {ORDER_STATUSES.map(
                (s) => (
                  <option
                    key={s}
                    value={s}
                  >
                    {s}
                  </option>
                )
              )}
            </select>
          </div>

          {/* TABLE */}

            <div
              style={{
                overflowX: "auto",
                overflowY: "auto",
                flex: 1,
              }}
            >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f9fafb",
                  }}
                >
                  {[
                    "Order",
                    "Customer",
                    "Status",
                    "Payment",
                    "Amount",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: 16,
                        textAlign:
                          "left",
                        fontSize: 14,
                        color: "#6b7280",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (o) => (
                    <tr
                      key={o._id}
                      onClick={() =>
                        setSelectedOrder(
                          o
                        )
                      }
                      style={{
                        cursor:
                          "pointer",
                        background:
                          selectedOrder?._id ===
                          o._id
                            ? "#f3f4f6"
                            : "#fff",
                      }}
                    >
                      <td
                        style={{
                          padding: 18,
                          borderBottom:
                            "1px solid #f3f4f6",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color:
                              "#111827",
                          }}
                        >
                          {
                            o.orderId
                          }
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color:
                              "#6b7280",
                            marginTop: 6,
                          }}
                        >
                          {new Date(
                            o.createdAt
                          ).toLocaleString()}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: 18,
                          borderBottom:
                            "1px solid #f3f4f6",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          {getCustomerName(
                            o
                          )}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            color:
                              "#6b7280",
                            fontSize: 13,
                          }}
                        >
                          {getCustomerPhone(
                            o
                          )}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: 18,
                          borderBottom:
                            "1px solid #f3f4f6",
                        }}
                      >
                        <span
                          style={{
                            ...getStatusStyle(
                              o.status
                            ),
                            padding:
                              "6px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>

                      <td
                        style={{
                          padding: 18,
                          borderBottom:
                            "1px solid #f3f4f6",
                          fontWeight: 600,
                        }}
                      >
                        {o.payment
                          ?.status ||
                          "PENDING"}
                      </td>

                      <td
                        style={{
                          padding: 18,
                          borderBottom:
                            "1px solid #f3f4f6",
                          fontWeight: 700,
                          color:
                            "#111827",
                        }}
                      >
                        ₹{o.amount}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL */}

          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border:
                "1px solid #e5e7eb",
              overflow: "hidden",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: 0,
            }}
          >
          {!selectedOrder ? (
            <div
              style={{
                padding: 40,
              }}
            >
              Select Order
            </div>
          ) : (
            <>
              {/* TOP */}

              <div
                style={{
                  padding: 24,
                  borderBottom:
                    "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 24,
                      }}
                    >
                      {
                        selectedOrder.orderId
                      }
                    </h2>

                    <p
                      style={{
                        color:
                          "#6b7280",
                        marginTop: 8,
                      }}
                    >
                      {new Date(
                        selectedOrder.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span
                    style={{
                      ...getStatusStyle(
                        selectedOrder.status
                      ),
                      padding:
                        "8px 14px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {
                      selectedOrder.status
                    }
                  </span>
                </div>
              </div>

              {/* DETAILS */}

              <div
                style={{
                  padding: 24,
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {/* CUSTOMER */}

                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <h3>
                    Customer Details
                  </h3>

                  <div
                    style={{
                      marginTop: 12,
                      color:
                        "#374151",
                      lineHeight: 1.8,
                    }}
                  >
                    <div>
                      <b>Name:</b>{" "}
                      {getCustomerName(
                        selectedOrder
                      )}
                    </div>

                    <div>
                      <b>Phone:</b>{" "}
                      {getCustomerPhone(
                        selectedOrder
                      )}
                    </div>

                    <div>
                      <b>Address:</b>{" "}
                      {
                        selectedOrder
                          ?.address
                          ?.address1
                      }
                    </div>

                    <div>
                      <b>Location:</b>{" "}
                      {getLocation(
                        selectedOrder
                      )}
                    </div>
                  </div>
                </div>

                {/* PAYMENT */}

                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <h3>
                    Payment Info
                  </h3>

                  <div
                    style={{
                      marginTop: 12,
                      color:
                        "#374151",
                      lineHeight: 1.8,
                    }}
                  >
                    <div>
                      <b>Status:</b>{" "}
                      {selectedOrder
                        ?.payment
                        ?.status ||
                        "PENDING"}
                    </div>

                    <div>
                      <b>Method:</b>{" "}
                      {selectedOrder
                        ?.payment
                        ?.method ||
                        "-"}
                    </div>

                    <div>
                      <b>UTR:</b>{" "}
                      {selectedOrder
                        ?.payment
                        ?.utr || "-"}
                    </div>
                  </div>
                </div>

                {/* SHIPPING */}

                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <h3>
                    Shipping Info
                  </h3>

                  <div
                    style={{
                      marginTop: 12,
                      color:
                        "#374151",
                      lineHeight: 1.8,
                    }}
                  >
                    <div>
                      <b>Courier:</b>{" "}
                      {selectedOrder
                        ?.shipping
                        ?.courierPartner ||
                        "-"}
                    </div>

                    <div>
                      <b>AWB:</b>{" "}
                      {selectedOrder
                        ?.shipping
                        ?.awbNumber ||
                        "-"}
                    </div>

                    <div>
                      <b>Status:</b>{" "}
                      {selectedOrder
                        ?.shipping
                        ?.trackingStatus ||
                        "-"}
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div
                  style={{
                    display: "grid",
                    gap: 12,
                  }}
                >
                  {selectedOrder
                    ?.payment?.status !==
                    "PAID" && (
                    <button
                      onClick={() =>
                        handleMarkPaid(
                          selectedOrder.orderId
                        )
                      }
                      style={{
                        height: 48,
                        border: "none",
                        borderRadius: 12,
                        background:
                          "#16a34a",
                        color: "#fff",
                        fontWeight: 700,
                        cursor:
                          "pointer",
                      }}
                    >
                      Mark As Paid
                    </button>
                  )}

                  <select
                    value={
                      selectedOrder.status
                    }
                    onChange={(e) =>
                      handleStatusUpdate(
                        selectedOrder.orderId,
                        e.target.value
                      )
                    }
                    style={{
                      height: 48,
                      borderRadius: 12,
                      border:
                        "1px solid #d1d5db",
                      padding:
                        "0px 14px",
                    }}
                  >
                    {ORDER_STATUSES.map(
                      (s) => (
                        <option
                          key={s}
                          value={s}
                        >
                          {s}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    onClick={() =>
                      handleLoadCouriers(
                        selectedOrder.orderId
                      )
                    }
                    style={{
                      height: 48,
                      border: "none",
                      borderRadius: 12,
                      background:
                        "#2563eb",
                      color: "#fff",
                      fontWeight: 700,
                      cursor:
                        "pointer",
                    }}
                  >
                    Load Couriers
                  </button>

                  <button
                    onClick={() =>
                      handleShipment(
                        selectedOrder.orderId,
                        "COURIER"
                      )
                    }
                    style={{
                      height: 48,
                      border: "none",
                      borderRadius: 12,
                      background:
                        "#ea580c",
                      color: "#fff",
                      fontWeight: 700,
                      cursor:
                        "pointer",
                    }}
                  >
                    Dispatch Shipment
                  </button>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <button
                      onClick={() =>
                        handleShipment(
                          selectedOrder.orderId,
                          "LOCAL_DELIVERY"
                        )
                      }
                      style={{
                        height: 46,
                        borderRadius: 12,
                        border:
                          "1px solid #d1d5db",
                        background:
                          "#fff",
                        fontWeight: 600,
                        cursor:
                          "pointer",
                      }}
                    >
                      Local
                    </button>

                    <button
                      onClick={() =>
                        handleShipment(
                          selectedOrder.orderId,
                          "BY_HAND"
                        )
                      }
                      style={{
                        height: 46,
                        borderRadius: 12,
                        border:
                          "1px solid #d1d5db",
                        background:
                          "#fff",
                        fontWeight: 600,
                        cursor:
                          "pointer",
                      }}
                    >
                      By Hand
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
