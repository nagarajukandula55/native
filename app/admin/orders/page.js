"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCcw,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

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

  const getStatusClasses = (
    currentStatus
  ) => {
    switch (currentStatus) {
      case "PENDING_PAYMENT":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";

      case "PAID":
        return "bg-green-500/15 text-green-400 border-green-500/20";

      case "PROCESSING":
        return "bg-blue-500/15 text-blue-400 border-blue-500/20";

      case "PACKED":
        return "bg-purple-500/15 text-purple-400 border-purple-500/20";

      case "DISPATCHED":
        return "bg-orange-500/15 text-orange-400 border-orange-500/20";

      case "DELIVERED":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";

      case "FAILED":
        return "bg-red-500/15 text-red-400 border-red-500/20";

      default:
        return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
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
        alert("Payment updated");
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
        .slice(0, 8)
        .forEach((c) => {
          txt += `
${c.courierName}
₹${c.rate}
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
          prompt("Courier ID") || "";

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
        alert("Shipment created");
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
    <div className="p-6 space-y-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Orders
          </h1>

          <p className="text-muted-foreground mt-1">
            Native commerce operations
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="h-11 px-5 rounded-xl border bg-background hover:bg-accent flex items-center gap-2 transition-all"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Orders
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {orders.length}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Package
                size={22}
                className="text-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Revenue
              </p>

              <h2 className="text-3xl font-bold mt-2">
                ₹{revenue}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <IndianRupee
                size={22}
                className="text-green-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Paid
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {
                  orders.filter(
                    (o) =>
                      o.payment?.status ===
                      "PAID"
                  ).length
                }
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <CreditCard
                size={22}
                className="text-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Dispatched
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {
                  orders.filter(
                    (o) =>
                      o.status ===
                      "DISPATCHED"
                  ).length
                }
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Truck
                size={22}
                className="text-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}

      <div className="grid xl:grid-cols-[1.4fr_420px] gap-6">
        {/* LEFT */}

        <div className="rounded-3xl border bg-card overflow-hidden">
          {/* TOOLBAR */}

          <div className="p-5 border-b flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search order, customer, phone"
                className="w-full h-12 pl-11 pr-4 rounded-xl border bg-background outline-none"
              />
            </div>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="h-12 px-4 rounded-xl border bg-background min-w-[220px]"
            >
              <option value="ALL">
                All Orders
              </option>

              {ORDER_STATUSES.map((s) => (
                <option
                  key={s}
                  value={s}
                >
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE */}

          <div className="overflow-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/30">
                <tr className="text-left">
                  <th className="px-5 py-4 text-sm font-medium">
                    Order
                  </th>

                  <th className="px-5 py-4 text-sm font-medium">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-sm font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 text-sm font-medium">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-10 text-center text-muted-foreground"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredOrders.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-10 text-center text-muted-foreground"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(
                    (o) => (
                      <tr
                        key={o._id}
                        onClick={() =>
                          setSelectedOrder(
                            o
                          )
                        }
                        className={`border-b cursor-pointer transition-all hover:bg-muted/40 ${
                          selectedOrder?._id ===
                          o._id
                            ? "bg-muted/50"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-5">
                          <div>
                            <h3 className="font-semibold">
                              {
                                o.orderId
                              }
                            </h3>

                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(
                                o.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div>
                            <h3 className="font-medium">
                              {getCustomerName(
                                o
                              )}
                            </h3>

                            <p className="text-sm text-muted-foreground mt-1">
                              {getCustomerPhone(
                                o
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div
                            className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${getStatusClasses(
                              o.status
                            )}`}
                          >
                            {o.status}
                          </div>
                        </td>

                        <td className="px-5 py-5 font-bold">
                          ₹{o.amount}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="rounded-3xl border bg-card overflow-hidden h-fit sticky top-6">
          {!selectedOrder ? (
            <div className="p-10 text-center text-muted-foreground">
              Select Order
            </div>
          ) : (
            <>
              {/* TOP */}

              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {
                        selectedOrder.orderId
                      }
                    </h2>

                    <p className="text-muted-foreground mt-1">
                      {new Date(
                        selectedOrder.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusClasses(
                      selectedOrder.status
                    )}`}
                  >
                    {
                      selectedOrder.status
                    }
                  </div>
                </div>
              </div>

              {/* BODY */}

              <div className="p-6 space-y-6">
                {/* CUSTOMER */}

                <div className="rounded-2xl border p-5">
                  <h3 className="font-semibold mb-4">
                    Customer
                  </h3>

                  <div className="space-y-2">
                    <p className="font-medium">
                      {getCustomerName(
                        selectedOrder
                      )}
                    </p>

                    <p className="text-muted-foreground">
                      {getCustomerPhone(
                        selectedOrder
                      )}
                    </p>

                    <p className="text-muted-foreground">
                      {selectedOrder
                        ?.address
                        ?.address1 || "-"}
                    </p>

                    <p className="text-muted-foreground">
                      {getLocation(
                        selectedOrder
                      )}
                    </p>
                  </div>
                </div>

                {/* PAYMENT */}

                <div className="rounded-2xl border p-5">
                  <h3 className="font-semibold mb-4">
                    Payment
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Status
                      </span>

                      <span className="font-medium">
                        {selectedOrder
                          ?.payment
                          ?.status ||
                          "PENDING"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Method
                      </span>

                      <span className="font-medium">
                        {selectedOrder
                          ?.payment
                          ?.method ||
                          "-"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        UTR
                      </span>

                      <span className="font-medium text-right break-all">
                        {selectedOrder
                          ?.payment
                          ?.utr || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SHIPPING */}

                <div className="rounded-2xl border p-5">
                  <h3 className="font-semibold mb-4">
                    Shipping
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Courier
                      </span>

                      <span className="font-medium">
                        {selectedOrder
                          ?.shipping
                          ?.courierPartner ||
                          "-"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        AWB
                      </span>

                      <span className="font-medium break-all text-right">
                        {selectedOrder
                          ?.shipping
                          ?.awbNumber ||
                          "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="space-y-3">
                  {selectedOrder
                    ?.payment?.status !==
                    "PAID" && (
                    <button
                      onClick={() =>
                        handleMarkPaid(
                          selectedOrder.orderId
                        )
                      }
                      className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
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
                    className="w-full h-12 rounded-xl border bg-background px-4"
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
                      handleCouriers(
                        selectedOrder.orderId
                      )
                    }
                    className="w-full h-12 rounded-xl border hover:bg-accent font-medium"
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
                    className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  >
                    Dispatch Shipment
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        handleShipment(
                          selectedOrder.orderId,
                          "LOCAL_DELIVERY"
                        )
                      }
                      className="h-11 rounded-xl border hover:bg-accent font-medium"
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
                      className="h-11 rounded-xl border hover:bg-accent font-medium"
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
