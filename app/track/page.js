"use client";

import { useState } from "react";

export default function TrackOrderPage() {

  const [input, setInput] =
    useState("");

  const [order, setOrder] =
    useState(null);

  const [tracking, setTracking] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================
     FETCH TRACKING
  ========================================= */

  const fetchOrder =
    async () => {

      try {

        setLoading(true);

        setError("");

        setOrder(null);

        setTracking(null);

        if (!input.trim()) {

          setError(
            "Please enter Order ID or AWB"
          );

          return;
        }

        /* =========================================
           TRY ORDER SEARCH
        ========================================= */

        let res =
          await fetch(

            `/api/orders/get-by-id?orderId=${input.trim()}`,

            {
              cache:
                "no-store",
            }
          );

        let data =
          await res.json()
            .catch(() => null);

        console.log(
          "ORDER RESPONSE:",
          data
        );

        /* =========================================
           ORDER FOUND
        ========================================= */

        if (
          res.ok &&
          data?.success
        ) {

          setOrder(
            data.order
          );

          /* ================= TRACK AWB ================= */

          if (
            data.order?.shipping
              ?.awbNumber
          ) {

            try {

              const tRes =
                await fetch(

                  `/api/shipping/track/${data.order.shipping.awbNumber}`
                );

              const tData =
                await tRes.json();

              if (
                tData?.success
              ) {

                setTracking(
                  tData
                );
              }

            } catch {}
          }

          return;
        }

        /* =========================================
           TRY AWB TRACKING
        ========================================= */

        const awbRes =
          await fetch(

            `/api/shipping/track/${input.trim()}`
          );

        const awbData =
          await awbRes.json();

        console.log(
          "AWB RESPONSE:",
          awbData
        );

        if (
          awbData?.success
        ) {

          setTracking(
            awbData
          );

          return;
        }

        setError(
          "Order / AWB not found"
        );

      } catch (err) {

        console.error(err);

        setError(
          "Something went wrong"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =========================================
     ORDER FLOW
  ========================================= */

  const steps = [

    "PENDING_PAYMENT",

    "PAID",

    "PROCESSING",

    "PACKED",

    "DISPATCHED",

    "DELIVERED",
  ];

  const currentIndex =
    steps.indexOf(
      order?.status ||
      "PENDING_PAYMENT"
    );

  /* =========================================
     TRACKING DATA
  ========================================= */

  const activities =

    tracking?.tracking
      ?.tracking_data
      ?.shipment_track_activities ||

    [];

  const shipment =

    tracking?.tracking
      ?.tracking_data
      ?.shipment_track?.[0] ||

    {};

  const currentStatus =

    shipment?.current_status ||

    tracking?.tracking
      ?.tracking_data
      ?.shipment_status ||

    "IN_TRANSIT";

  return (
    <div style={container}>

      <div style={hero}>

        <h1 style={heroTitle}>
          📦 Track Shipment
        </h1>

        <p style={heroSub}>
          Enter Order ID or AWB Number
        </p>

        {/* SEARCH */}

        <div style={searchBox}>

          <input
            placeholder="Enter Order ID / AWB"
            value={input}
            onChange={(e) =>
              setInput(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <button
            onClick={fetchOrder}
            style={btn}
          >
            Track
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div style={loadingBox}>
          Loading tracking...
        </div>
      )}

      {/* ORDER CARD */}

      {order && (

        <div style={card}>

          <div style={cardTop}>

            <div>

              <h2>
                Order #
                {order.orderId}
              </h2>

              <p>
                {order.address?.name}
              </p>

            </div>

            <div style={statusPill}>
              {order.status}
            </div>

          </div>

          <div style={infoGrid}>

            <div>
              <b>Phone</b>
              <p>
                {
                  order.address?.phone
                }
              </p>
            </div>

            <div>
              <b>Amount</b>
              <p>
                ₹{order.amount}
              </p>
            </div>

            <div>
              <b>Payment</b>
              <p>
                {
                  order.payment
                    ?.status
                }
              </p>
            </div>

            <div>
              <b>AWB</b>
              <p>
                {
                  order.shipping
                    ?.awbNumber || "-"
                }
              </p>
            </div>

          </div>

          {/* TIMELINE */}

          <div style={timeline}>

            {steps.map(
              (step, index) => {

                const active =
                  index <=
                  currentIndex;

                return (

                  <div
                    key={step}
                    style={
                      stepBox
                    }
                  >

                    <div
                      style={{
                        ...circle,

                        background:
                          active
                            ? "#16a34a"
                            : "#ddd",
                      }}
                    />

                    <div>

                      <div
                        style={{
                          fontWeight: 700,

                          color:
                            active
                              ? "#111"
                              : "#aaa",
                        }}
                      >
                        {step}
                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* ITEMS */}

          <div
            style={{
              marginTop: 24,
            }}
          >

            <h3>
              Items
            </h3>

            {order.items?.map(
              (item, i) => (

                <div
                  key={i}
                  style={
                    itemRow
                  }
                >

                  <span>
                    {item.name}
                    {" x "}
                    {item.qty}
                  </span>

                  <span>
                    ₹
                    {item.price *
                      item.qty}
                  </span>

                </div>
              )
            )}

          </div>

        </div>
      )}

      {/* SHIPPING TRACKING */}

      {tracking && (

        <div style={trackingCard}>

          <div style={trackingHeader}>

            <div>

              <h2>
                🚚 Live Shipment
              </h2>

              <p>
                AWB:
                {" "}
                {tracking.awb}
              </p>

            </div>

            <div style={liveBadge}>
              {currentStatus}
            </div>

          </div>

          <div style={courierBox}>

            Courier:
            {" "}

            <b>
              {
                shipment?.courier_name ||
                "-"
              }
            </b>

          </div>

          {/* ACTIVITIES */}

          <div style={activitiesWrap}>

            {activities.map(
              (a, index) => (

                <div
                  key={index}
                  style={
                    activityRow
                  }
                >

                  <div
                    style={
                      activityDot
                    }
                  />

                  <div>

                    <div
                      style={
                        activityTitle
                      }
                    >
                      {
                        a.activity
                      }
                    </div>

                    <div
                      style={
                        activityLocation
                      }
                    >
                      {
                        a.location
                      }
                    </div>

                    <div
                      style={
                        activityDate
                      }
                    >
                      {
                        a.date
                      }
                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================
   STYLES
========================================= */

const container = {

  minHeight: "100vh",

  background:
    "#f5f7fb",

  padding: 20,
};

const hero = {

  maxWidth: 1000,

  margin: "0 auto 30px",

  background:
    "linear-gradient(135deg,#111,#222)",

  color: "#fff",

  borderRadius: 24,

  padding: 40,
};

const heroTitle = {

  fontSize: 36,

  marginBottom: 8,
};

const heroSub = {

  opacity: 0.8,

  marginBottom: 24,
};

const searchBox = {

  display: "flex",

  gap: 12,

  flexWrap: "wrap",
};

const inputStyle = {

  flex: 1,

  minWidth: 250,

  padding: 14,

  borderRadius: 12,

  border: "none",
};

const btn = {

  padding:
    "14px 24px",

  border: "none",

  borderRadius: 12,

  background: "#16a34a",

  color: "#fff",

  fontWeight: 700,

  cursor: "pointer",
};

const loadingBox = {

  textAlign: "center",

  marginTop: 30,
};

const errorBox = {

  maxWidth: 1000,

  margin: "20px auto",

  background: "#fee2e2",

  color: "#991b1b",

  padding: 16,

  borderRadius: 12,
};

const card = {

  maxWidth: 1000,

  margin: "0 auto 24px",

  background: "#fff",

  borderRadius: 20,

  padding: 24,

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.06)",
};

const cardTop = {

  display: "flex",

  justifyContent:
    "space-between",

  alignItems: "center",

  marginBottom: 24,

  flexWrap: "wrap",

  gap: 12,
};

const statusPill = {

  background: "#111",

  color: "#fff",

  padding:
    "10px 16px",

  borderRadius: 999,
};

const infoGrid = {

  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",

  gap: 16,

  marginBottom: 30,
};

const timeline = {

  display: "flex",

  flexDirection: "column",

  gap: 14,
};

const stepBox = {

  display: "flex",

  gap: 12,

  alignItems: "center",
};

const circle = {

  width: 14,

  height: 14,

  borderRadius: 999,
};

const itemRow = {

  display: "flex",

  justifyContent:
    "space-between",

  padding:
    "10px 0",

  borderBottom:
    "1px solid #eee",
};

const trackingCard = {

  maxWidth: 1000,

  margin: "0 auto",

  background: "#fff",

  borderRadius: 20,

  padding: 24,

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.06)",
};

const trackingHeader = {

  display: "flex",

  justifyContent:
    "space-between",

  alignItems: "center",

  flexWrap: "wrap",

  gap: 10,

  marginBottom: 20,
};

const liveBadge = {

  background: "#dcfce7",

  color: "#166534",

  padding:
    "10px 16px",

  borderRadius: 999,

  fontWeight: 700,
};

const courierBox = {

  marginBottom: 24,
};

const activitiesWrap = {

  display: "flex",

  flexDirection: "column",

  gap: 20,
};

const activityRow = {

  display: "flex",

  gap: 16,

  borderLeft:
    "2px solid #ddd",

  paddingLeft: 20,

  position: "relative",
};

const activityDot = {

  width: 14,

  height: 14,

  borderRadius: 999,

  background: "#111",

  position: "absolute",

  left: -8,

  top: 4,
};

const activityTitle = {

  fontWeight: 700,

  marginBottom: 4,
};

const activityLocation = {

  color: "#555",

  marginBottom: 4,
};

const activityDate = {

  color: "#888",

  fontSize: 13,
};
