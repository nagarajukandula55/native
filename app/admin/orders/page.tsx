
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
          getCustomerPhone(o)
            .toLowerCase()
            .includes(search.toLowerCase()) ||
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
    <div className="min-h-screen bg-[#050816] text-white">
      {/* TOP NAV */}

      <div className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-2xl bg-black/40">
        <div className="px-6 py-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Native Commerce OMS
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Powered by AN Group Unified Engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="bg-white text-black font-bold px-6 py-3 rounded-2xl hover:scale-[1.02] transition-all"
            >
              Refresh Orders
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* STATS */}

        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#0d1323] border border-white/10 rounded-3xl p-5">
            <p className="text-gray-400 text-sm">
              Total Orders
            </p>

            <h2 className="text-3xl font-black mt-2">
              {orders.length}
            </h2>
          </div>

          <div className="bg-[#0d1323] border border-white/10 rounded-3xl p-5">
            <p className="text-gray-400 text-sm">
              Paid
            </p>

            <h2 className="text-3xl font-black mt-2 text-green-400">
              {
                orders.filter(
                  (o) =>
                    o.payment?.status ===
                    "PAID"
                ).length
              }
            </h2>
          </div>

          <div className="bg-[#0d1323] border border-white/10 rounded-3xl p-5">
            <p className="text-gray-400 text-sm">
              Processing
            </p>

            <h2 className="text-3xl font-black mt-2 text-blue-400">
              {
                orders.filter(
                  (o) =>
                    o.status ===
                    "PROCESSING"
                ).length
              }
            </h2>
          </div>

          <div className="bg-[#0d1323] border border-white/10 rounded-3xl p-5">
            <p className="text-gray-400 text-sm">
              Dispatched
            </p>

            <h2 className="text-3xl font-black mt-2 text-orange-400">
              {
                orders.filter(
                  (o) =>
                    o.status ===
                    "DISPATCHED"
                ).length
              }
            </h2>
          </div>

          <div className="bg-[#0d1323] border border-white/10 rounded-3xl p-5">
            <p className="text-gray-400 text-sm">
              Delivered
            </p>

            <h2 className="text-3xl font-black mt-2 text-emerald-400">
              {
                orders.filter(
                  (o) =>
                    o.status ===
                    "DELIVERED"
                ).length
              }
            </h2>
          </div>
        </div>

        {/* FILTERS */}

        <div className="bg-[#0d1323] border border-white/10 rounded-3xl p-5 mb-8">
          <div className="flex flex-col xl:flex-row gap-4">
            <input
              placeholder="Search order / customer / phone"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none"
            />

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="bg-black/30 border border-white/10 rounded-2xl px-5 py-4 min-w-[240px]"
            >
              <option value="ALL">
                All Orders
              </option>

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
          </div>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="bg-[#0d1323] border border-white/10 rounded-3xl p-20 text-center">
            Loading Orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0d1323] border border-white/10 rounded-3xl p-20 text-center">
            No Orders Found
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((o) => (
              <div
                key={o._id}
                className="bg-[#0d1323] border border-white/10 rounded-3xl overflow-hidden"
              >
                {/* HEADER */}

                <div className="border-b border-white/10 px-6 py-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-4">
                      <h2 className="text-2xl font-black">
                        {o.orderId}
                      </h2>

                      <span
                        className="px-4 py-2 rounded-full text-xs font-bold text-white"
                        style={{
                          background:
                            getStatusColor(
                              o.status
                            ),
                        }}
                      >
                        {o.status}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm mt-2">
                      {o.createdAt
                        ? new Date(
                            o.createdAt
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-400 text-sm">
                      Order Value
                    </p>

                    <h2 className="text-4xl font-black">
                      ₹{o.amount}
                    </h2>
                  </div>
                </div>

                {/* BODY */}

                <div className="grid xl:grid-cols-[1fr_320px]">
                  {/* LEFT */}

                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-5">
                      {/* CUSTOMER */}

                      <div className="bg-black/20 border border-white/5 rounded-3xl p-5">
                        <p className="text-gray-500 text-xs uppercase tracking-wider">
                          Customer
                        </p>

                        <h3 className="text-xl font-bold mt-3">
                          {getCustomerName(
                            o
                          )}
                        </h3>

                        <p className="text-gray-300 mt-2">
                          {getCustomerPhone(
                            o
                          )}
                        </p>

                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                          {
                            o.address
                              ?.address1
                          }
                          <br />
                          {
                            o.address
                              ?.city
                          }
                          ,{" "}
                          {
                            o.address
                              ?.state
                          }
                          <br />
                          {
                            o.address
                              ?.pincode
                          }
                        </p>
                      </div>

                      {/* PAYMENT */}

                      <div className="bg-black/20 border border-white/5 rounded-3xl p-5">
                        <p className="text-gray-500 text-xs uppercase tracking-wider">
                          Payment
                        </p>

                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="text-gray-500 text-sm">
                              Status
                            </p>

                            <p className="font-bold mt-1">
                              {o.payment
                                ?.status ||
                                "PENDING"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 text-sm">
                              Method
                            </p>

                            <p className="font-bold mt-1">
                              {o.payment
                                ?.method ||
                                "N/A"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 text-sm">
                              UTR
                            </p>

                            <p className="font-bold mt-1 break-all">
                              {o.payment
                                ?.utr ||
                                "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* SHIPPING */}

                      <div className="bg-black/20 border border-white/5 rounded-3xl p-5">
                        <p className="text-gray-500 text-xs uppercase tracking-wider">
                          Shipping
                        </p>

                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="text-gray-500 text-sm">
                              Courier
                            </p>

                            <p className="font-bold mt-1">
                              {o.shipping
                                ?.courierPartner ||
                                "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 text-sm">
                              AWB
                            </p>

                            <p className="font-bold mt-1 break-all">
                              {o.shipping
                                ?.awbNumber ||
                                "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-500 text-sm">
                              Tracking
                            </p>

                            <p className="font-bold mt-1">
                              {o.shipping
                                ?.trackingStatus ||
                                "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="border-l border-white/10 p-6 bg-black/20">
                    <div className="space-y-4">
                      {o.payment?.status !==
                        "PAID" && (
                        <button
                          onClick={() =>
                            handleMarkAsPaid(
                              o.orderId
                            )
                          }
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition-all"
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
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4"
                      >
                        {ORDER_STATUSES.map(
                          (s) => (
                            <option
                              key={s}
                              value={s}
                              className="text-black"
                            >
                              {s}
                            </option>
                          )
                        )}
                      </select>

                      <button
                        onClick={() =>
                          handleLoadCouriers(
                            o.orderId
                          )
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold"
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
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold"
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
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold"
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
                        className="w-full bg-gray-700 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold"
                      >
                        By Hand Delivery
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
