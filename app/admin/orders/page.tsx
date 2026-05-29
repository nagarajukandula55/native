
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

/* =========================================
   TYPES
========================================= */

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
    name?: string;
    phone?: string;
    address1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  user?: {
    name?: string;
    phone?: string;
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

/* =========================================
   HELPERS
========================================= */

const getCustomerName = (o: Order) => {
  return (
    o.customer?.name ||
    o.address?.name ||
    o.user?.name ||
    "N/A"
  );
};

const getCustomerPhone = (o: Order) => {
  return (
    o.customer?.phone ||
    o.address?.phone ||
    o.user?.phone ||
    "N/A"
  );
};

const getCustomerLocation = (o: Order) => {
  return `${o.address?.city || "-"}, ${
    o.address?.state || "-"
  }`;
};

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

/* =========================================
   PAGE
========================================= */

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
      console.log(err);
      alert("Failed to load orders");
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
          getCustomerPhone(o).includes(search) ||
          getCustomerName(o)
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    return temp;
  }, [orders, search, status]);

  /* =========================================
     MARK PAID
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

        if (!courierId) return;
      }

      const data = await createShipment(
        orderId,
        dispatchType,
        courierId
      );

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
     STATUS COLORS
  ========================================= */

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "#f59e0b";

      case "PAID":
        return "#22c55e";

      case "PROCESSING":
        return "#3b82f6";

      case "PACKED":
        return "#8b5cf6";

      case "DISPATCHED":
        return "#f97316";

      case "DELIVERED":
        return "#10b981";

      case "FAILED":
        return "#ef4444";

      default:
        return "#6b7280";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f172a] to-[#111827] text-white p-6">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Native Orders
          </h1>

          <p className="text-gray-400 mt-2">
            AN Group Unified Commerce Engine
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="bg-white text-black font-bold px-6 py-3 rounded-2xl hover:scale-[1.03] transition-all"
        >
          Refresh Orders
        </button>
      </div>

      {/* SEARCH */}

      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-5 mb-6">
        <input
          placeholder="Search order / customer / phone"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white outline-none"
        />
      </div>

      {/* FILTERS */}

      <div className="flex flex-wrap gap-3 mb-8">
        {["ALL", ...ORDER_STATUSES].map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all
              ${
                status === s
                  ? "bg-white text-black"
                  : "bg-white/5 border border-white/10 text-white"
              }`}
            >
              {s}
            </button>
          )
        )}
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10">
          Loading Orders...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10">
          No Orders Found
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map((o) => (
            <div
              key={o._id}
              className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex flex-col xl:flex-row xl:justify-between gap-8">
                {/* LEFT */}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <h2 className="text-2xl font-black">
                      {o.orderId}
                    </h2>

                    <span
                      className="px-4 py-2 rounded-full text-xs font-bold text-white"
                      style={{
                        background:
                          getStatusColor(o.status),
                      }}
                    >
                      {o.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 mt-6">
                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                      <p className="text-gray-400 text-sm">
                        Customer
                      </p>

                      <h3 className="text-lg font-bold mt-1">
                        {getCustomerName(o)}
                      </h3>

                      <p className="text-gray-300 mt-2">
                        {getCustomerPhone(o)}
                      </p>

                      <p className="text-gray-500 mt-1 text-sm">
                        {getCustomerLocation(o)}
                      </p>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                      <p className="text-gray-400 text-sm">
                        Payment
                      </p>

                      <h3 className="text-2xl font-black mt-1">
                        ₹{o.amount}
                      </h3>

                      <p className="mt-2">
                        Status:
                        <span className="font-bold ml-2">
                          {o.payment?.status ||
                            "PENDING"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        Method:
                        {" "}
                        {o.payment?.method ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* SHIPPING */}

                  {o.shipping?.awbNumber && (
                    <div className="mt-5 bg-black/20 rounded-2xl p-5 border border-white/5">
                      <h3 className="font-bold mb-4">
                        Shipping Details
                      </h3>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">
                            Courier
                          </p>

                          <p className="font-semibold mt-1">
                            {
                              o.shipping
                                ?.courierPartner
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400">
                            AWB Number
                          </p>

                          <p className="font-semibold mt-1">
                            {
                              o.shipping
                                ?.awbNumber
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-400">
                            Tracking
                          </p>

                          <p className="font-semibold mt-1">
                            {
                              o.shipping
                                ?.trackingStatus
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT */}

                <div className="w-full xl:w-[280px] flex flex-col gap-4">
                  {o.payment?.status !==
                    "PAID" && (
                    <button
                      onClick={() =>
                        handleMarkAsPaid(
                          o.orderId
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition-all"
                    >
                      Mark As Paid
                    </button>
                  )}

                  <select
                    defaultValue={o.status}
                    onChange={(e) =>
                      handleUpdateStatus(
                        o.orderId,
                        e.target.value
                      )
                    }
                    className="bg-black/30 border border-white/10 rounded-2xl p-4 text-white"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option
                        key={s}
                        value={s}
                        className="text-black"
                      >
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      handleLoadCouriers(
                        o.orderId
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold"
                  >
                    Load Couriers
                  </button>

                  <button
                    onClick={() =>
                      handleCreateShipment(
                        o.orderId,
                        "COURIER"
                      )
                    }
                    className="bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold"
                  >
                    Dispatch Shipment
                  </button>

                  <button
                    onClick={() =>
                      handleCreateShipment(
                        o.orderId,
                        "LOCAL_DELIVERY"
                      )
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold"
                  >
                    Local Delivery
                  </button>

                  <button
                    onClick={() =>
                      handleCreateShipment(
                        o.orderId,
                        "BY_HAND"
                      )
                    }
                    className="bg-gray-700 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold"
                  >
                    By Hand Delivery
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
