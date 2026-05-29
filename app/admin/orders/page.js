
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

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";

      case "PAID":
        return "bg-green-500/20 text-green-300 border-green-500/30";

      case "PROCESSING":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";

      case "PACKED":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";

      case "DISPATCHED":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";

      case "DELIVERED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

      case "FAILED":
        return "bg-red-500/20 text-red-300 border-red-500/30";

      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

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
     FILTERED
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
          getCustomerPhone(o)
            .includes(search)
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
        alert("Payment Updated");
        fetchOrders();
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
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleCouriers = async (
    orderId
  ) => {
    try {
      const data =
        await loadShippingRates(
          orderId
        );

      console.log(data);

      alert(
        JSON.stringify(
          data?.couriers?.slice(0, 5),
          null,
          2
        )
      );
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
        alert("Shipment Created");
        fetchOrders();
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================================
     TOTALS
  ========================================= */

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      {/* BACKGROUND */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[140px]" />

        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[140px]" />
      </div>

      {/* MAIN */}

      <div className="relative z-10 p-6">
        {/* TOP BAR */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-5xl font-black tracking-tight">
              Orders OMS
            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Native Commerce • Powered by
              AN Group
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-white text-black font-bold px-7 py-4 rounded-2xl hover:scale-[1.03] transition-all"
          >
            Refresh Orders
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
            <p className="text-gray-400 text-sm">
              Total Orders
            </p>

            <h2 className="text-4xl font-black mt-3">
              {orders.length}
            </h2>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
            <p className="text-gray-400 text-sm">
              Revenue
            </p>

            <h2 className="text-4xl font-black mt-3">
              ₹{totalRevenue}
            </h2>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
            <p className="text-gray-400 text-sm">
              Paid Orders
            </p>

            <h2 className="text-4xl font-black mt-3 text-green-400">
              {
                orders.filter(
                  (o) =>
                    o.payment?.status ===
                    "PAID"
                ).length
              }
            </h2>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
            <p className="text-gray-400 text-sm">
              Dispatched
            </p>

            <h2 className="text-4xl font-black mt-3 text-orange-400">
              {
                orders.filter(
                  (o) =>
                    o.status ===
                    "DISPATCHED"
                ).length
              }
            </h2>
          </div>
        </div>

        {/* FILTERS */}

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 mb-8">
          <div className="flex flex-col xl:flex-row gap-4">
            <input
              placeholder="Search by order / customer / phone"
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
          <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center text-xl">
            Loading Orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center text-xl">
            No Orders Found
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((o) => (
              <div
                key={o._id}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden"
              >
                {/* HEADER */}

                <div className="border-b border-white/10 px-7 py-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-4">
                      <h2 className="text-3xl font-black">
                        {o.orderId}
                      </h2>

                      <div
                        className={`px-4 py-2 rounded-full border text-xs font-bold ${getStatusColor(
                          o.status
                        )}`}
                      >
                        {o.status}
                      </div>
                    </div>

                    <p className="text-gray-500 mt-3">
                      {o.createdAt
                        ? new Date(
                            o.createdAt
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="text-left xl:text-right">
                    <p className="text-gray-500 text-sm">
                      Order Value
                    </p>

                    <h2 className="text-5xl font-black mt-2">
                      ₹{o.amount}
                    </h2>
                  </div>
                </div>

                {/* BODY */}

                <div className="grid xl:grid-cols-[1fr_340px]">
                  {/* LEFT */}

                  <div className="p-7">
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {/* CUSTOMER */}

                      <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                        <p className="text-gray-500 text-xs uppercase tracking-widest">
                          Customer
                        </p>

                        <h3 className="text-2xl font-bold mt-4">
                          {getCustomerName(
                            o
                          )}
                        </h3>

                        <p className="text-gray-300 mt-2 text-lg">
                          {getCustomerPhone(
                            o
                          )}
                        </p>

                        <div className="mt-5 text-gray-400 leading-relaxed">
                          <p>
                            {
                              o.address
                                ?.address1
                            }
                          </p>

                          <p className="mt-1">
                            {getLocation(o)}
                          </p>

                          <p className="mt-1">
                            {
                              o.address
                                ?.pincode
                            }
                          </p>
                        </div>
                      </div>

                      {/* PAYMENT */}

                      <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                        <p className="text-gray-500 text-xs uppercase tracking-widest">
                          Payment
                        </p>

                        <div className="space-y-5 mt-5">
                          <div>
                            <p className="text-gray-500 text-sm">
                              Status
                            </p>

                            <h4 className="font-bold text-xl mt-1">
                              {o.payment
                                ?.status ||
                                "PENDING"}
                            </h4>
                          </div>

                          <div>
                            <p className="text-gray-500 text-sm">
                              Method
                            </p>

                            <h4 className="font-bold text-xl mt-1">
                              {o.payment
                                ?.method ||
                                "-"}
                            </h4>
                          </div>

                          <div>
                            <p className="text-gray-500 text-sm">
                              UTR
                            </p>

                            <h4 className="font-bold mt-1 break-all">
                              {o.payment
                                ?.utr ||
                                "-"}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* SHIPPING */}

                      <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                        <p className="text-gray-500 text-xs uppercase tracking-widest">
                          Shipping
                        </p>

                        <div className="space-y-5 mt-5">
                          <div>
                            <p className="text-gray-500 text-sm">
                              Courier
                            </p>

                            <h4 className="font-bold text-xl mt-1">
                              {o.shipping
                                ?.courierPartner ||
                                "-"}
                            </h4>
                          </div>

                          <div>
                            <p className="text-gray-500 text-sm">
                              AWB
                            </p>

                            <h4 className="font-bold mt-1 break-all">
                              {o.shipping
                                ?.awbNumber ||
                                "-"}
                            </h4>
                          </div>

                          <div>
                            <p className="text-gray-500 text-sm">
                              Tracking
                            </p>

                            <h4 className="font-bold text-xl mt-1">
                              {o.shipping
                                ?.trackingStatus ||
                                "-"}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="border-l border-white/10 bg-black/20 p-6">
                    <div className="sticky top-6">
                      <p className="text-gray-500 text-xs uppercase tracking-widest mb-5">
                        Actions
                      </p>

                      <div className="space-y-4">
                        {o.payment?.status !==
                          "PAID" && (
                          <button
                            onClick={() =>
                              handleMarkPaid(
                                o.orderId
                              )
                            }
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg transition-all"
                          >
                            Mark As Paid
                          </button>
                        )}

                        <select
                          defaultValue={o.status}
                          onChange={(e) =>
                            handleStatusUpdate(
                              o.orderId,
                              e.target.value
                            )
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4"
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
                            handleCouriers(
                              o.orderId
                            )
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold"
                        >
                          Load Couriers
                        </button>

                        <button
                          onClick={() =>
                            handleShipment(
                              o.orderId,
                              "COURIER"
                            )
                          }
                          className="w-full bg-orange-500 hover:bg-orange-600 py-4 rounded-2xl font-bold"
                        >
                          Dispatch Shipment
                        </button>

                        <button
                          onClick={() =>
                            handleShipment(
                              o.orderId,
                              "LOCAL_DELIVERY"
                            )
                          }
                          className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-2xl font-bold"
                        >
                          Local Delivery
                        </button>

                        <button
                          onClick={() =>
                            handleShipment(
                              o.orderId,
                              "BY_HAND"
                            )
                          }
                          className="w-full bg-gray-700 hover:bg-gray-800 py-4 rounded-2xl font-bold"
                        >
                          By Hand Delivery
                        </button>
                      </div>
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
