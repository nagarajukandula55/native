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

interface Order {
  _id: string;
  orderId: string;
  amount: number;
  status: string;
  createdAt?: string;

  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };

  address?: {
    address1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  payment?: {
    status?: string;
    method?: string;
    utr?: string;
  };

  shipping?: {
    courierPartner?: string;
    awbNumber?: string;
    trackingStatus?: string;
  };
}

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
  const [orders, setOrders] = useState<Order[]>([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("ALL");

  const [loading, setLoading] = useState(false);

  /* =========================================
     FETCH ORDERS
  ========================================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const data = await getOrders();

      if (data?.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =========================================
     FILTERED ORDERS
  ========================================= */

  const filtered = useMemo(() => {
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
          o.customer?.phone?.includes(search) ||
          o.customer?.name
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    return temp;
  }, [orders, search, status]);

  /* =========================================
     MARK AS PAID
  ========================================= */

  const handleMarkAsPaid = async (
    orderId: string
  ) => {
    const utr = prompt(
      "Enter UTR / Reference Number"
    );

    if (utr === null) return;

    try {
      const data = await markAsPaid(
        orderId,
        utr
      );

      if (data.success) {
        alert("Payment Marked Successfully ✅");

        fetchOrders();
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      console.log(err);
      alert("Payment update failed");
    }
  };

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      const data = await updateOrderStatus(
        orderId,
        newStatus
      );

      if (data.success) {
        alert("Status Updated ✅");

        fetchOrders();
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      console.log(err);
      alert("Status update failed");
    }
  };

  /* =========================================
     LOAD COURIERS
  ========================================= */

  const handleLoadCouriers = async (
    orderId: string
  ) => {
    try {
      const data = await loadShippingRates(
        orderId
      );

      console.log(data);

      if (!data.success) {
        alert(data.message || "Failed");
        return;
      }

      if (!data.couriers?.length) {
        alert("No couriers found");
        return;
      }

      let text = "AVAILABLE COURIERS\n\n";

      data.couriers
        .slice(0, 10)
        .forEach((c: any) => {
          text += `
${c.courierName}
Rate: ₹${c.rate}
ETA: ${c.etd}
Courier ID: ${c.courierId}

`;
        });

      alert(text);
    } catch (err) {
      console.log(err);
      alert("Courier loading failed");
    }
  };

  /* =========================================
     CREATE SHIPMENT
  ========================================= */

  const handleCreateShipment = async (
    orderId: string,
    dispatchType: string
  ) => {
    try {
      let courierId = "";

      if (dispatchType === "COURIER") {
        courierId =
          prompt("Enter Courier ID") || "";

        if (!courierId) {
          return;
        }
      }

      const data = await createShipment(
        orderId,
        dispatchType,
        courierId
      );

      console.log(data);

      if (data.success) {
        alert("Shipment Created ✅");

        fetchOrders();
      } else {
        alert(data.message || "Shipment failed");
      }
    } catch (err) {
      console.log(err);
      alert("Shipment creation failed");
    }
  };

  /* =========================================
     STATUS COLOR
  ========================================= */

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "#f59e0b";

      case "PAID":
        return "#16a34a";

      case "PROCESSING":
        return "#2563eb";

      case "PACKED":
        return "#7c3aed";

      case "DISPATCHED":
        return "#ea580c";

      case "DELIVERED":
        return "#111827";

      case "FAILED":
        return "#dc2626";

      default:
        return "#666";
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-6">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            📦 Native Orders
          </h1>

          <p className="text-gray-500 mt-1">
            Processing AN Group Orders
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-black text-white px-5 py-3 rounded-xl"
        >
          Refresh
        </button>
      </div>

      {/* SEARCH */}

      <div className="bg-white p-4 rounded-2xl shadow-sm border mb-5">
        <input
          placeholder="Search order / phone / customer"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full border rounded-xl p-3 outline-none"
        />
      </div>

      {/* FILTERS */}

      <div className="flex flex-wrap gap-3 mb-6">
        {["ALL", ...ORDER_STATUSES].map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition
              ${
                status === s
                  ? "bg-black text-white"
                  : "bg-white border"
              }`}
            >
              {s}
            </button>
          )
        )}
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          Loading Orders...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          No Orders Found
        </div>
      ) : (
        <div className="grid gap-5">
          {filtered.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-3xl border shadow-sm p-5"
            >
              {/* TOP */}

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                {/* LEFT */}

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold">
                      {o.orderId}
                    </h2>

                    <span
                      className="text-white text-xs px-3 py-1 rounded-full font-semibold"
                      style={{
                        background:
                          getStatusColor(o.status),
                      }}
                    >
                      {o.status}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-700">
                    <div>
                      👤
                      <b>
                        {o.customer?.name ||
                          "N/A"}
                      </b>
                    </div>

                    <div>
                      📞
                      {o.customer?.phone ||
                        "N/A"}
                    </div>

                    <div>
                      📍
                      {o.address?.city},{" "}
                      {o.address?.state}
                    </div>

                    <div className="mt-2">
                      💳 Payment:
                      <b>
                        {o.payment?.status ||
                          "PENDING"}
                      </b>
                    </div>

                    <div>
                      💰 Amount:
                      <b>₹{o.amount}</b>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}

                <div className="flex flex-col gap-3 min-w-[260px]">
                  {/* MARK PAID */}

                  {o.payment?.status !==
                    "PAID" && (
                    <button
                      onClick={() =>
                        handleMarkAsPaid(
                          o.orderId
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                    >
                      ✅ Mark As Paid
                    </button>
                  )}

                  {/* STATUS */}

                  <select
                    defaultValue={o.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        o.orderId,
                        e.target.value
                      )
                    }
                    className="border p-3 rounded-xl"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option
                        key={s}
                        value={s}
                      >
                        {s}
                      </option>
                    ))}
                  </select>

                  {/* COURIER */}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleLoadCouriers(
                          o.orderId
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold"
                    >
                      🚚 Couriers
                    </button>

                    <button
                      onClick={() =>
                        handleCreateShipment(
                          o.orderId,
                          "COURIER"
                        )
                      }
                      className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold"
                    >
                      Dispatch
                    </button>
                  </div>

                  {/* LOCAL */}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleCreateShipment(
                          o.orderId,
                          "LOCAL_DELIVERY"
                        )
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-semibold"
                    >
                      Local
                    </button>

                    <button
                      onClick={() =>
                        handleCreateShipment(
                          o.orderId,
                          "BY_HAND"
                        )
                      }
                      className="bg-gray-800 hover:bg-black text-white py-3 rounded-xl text-sm font-semibold"
                    >
                      By Hand
                    </button>
                  </div>
                </div>
              </div>

              {/* SHIPPING */}

              {o.shipping?.awbNumber && (
                <div className="mt-5 bg-gray-50 rounded-2xl p-4 border">
                  <h3 className="font-bold mb-3">
                    🚚 Shipping Details
                  </h3>

                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <b>Courier:</b>
                      {o.shipping
                        ?.courierPartner}
                    </div>

                    <div>
                      <b>AWB:</b>
                      {o.shipping?.awbNumber}
                    </div>

                    <div>
                      <b>Status:</b>
                      {
                        o.shipping
                          ?.trackingStatus
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
