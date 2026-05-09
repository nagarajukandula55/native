export default function EnterpriseFulfillmentDashboard() {
  const stats = [
    {
      title: "Total Orders",
      value: "1,248",
      growth: "+12%",
    },
    {
      title: "Packed Today",
      value: "342",
      growth: "+8%",
    },
    {
      title: "In Transit",
      value: "511",
      growth: "+23%",
    },
    {
      title: "Delivered",
      value: "924",
      growth: "+16%",
    },
  ];

  const recentOrders = [
    {
      id: "NA-250509-000001",
      customer: "Rahul Kumar",
      amount: "₹14,999",
      status: "PACKED",
    },
    {
      id: "NA-250509-000002",
      customer: "Arjun Reddy",
      amount: "₹9,499",
      status: "DISPATCHED",
    },
    {
      id: "NA-250509-000003",
      customer: "Vikram Singh",
      amount: "₹2,999",
      status: "DELIVERED",
    },
    {
      id: "NA-250509-000004",
      customer: "Naveen",
      amount: "₹18,499",
      status: "PROCESSING",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900">
              Enterprise Fulfillment Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Live warehouse, shipping and order monitoring
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button className="bg-black text-white px-5 py-3 rounded-2xl font-semibold shadow-lg">
              Generate Manifest
            </button>

            <button className="bg-green-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg">
              Print Labels
            </button>

            <button className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg">
              Create Shipment
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {stats.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200"
            >
              <div className="text-sm text-gray-500 mb-2">
                {item.title}
              </div>

              <div className="flex items-end justify-between">
                <h2 className="text-4xl font-black text-gray-900">
                  {item.value}
                </h2>

                <span className="text-green-600 font-bold text-sm">
                  {item.growth}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ORDERS */}
          <div className="xl:col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  Recent Orders
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Real-time order management
                </p>
              </div>

              <input
                placeholder="Search Order / Phone"
                className="border border-gray-300 rounded-2xl px-4 py-3 w-72 outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100"
                    >
                      <td className="py-5 font-semibold text-gray-900">
                        {order.id}
                      </td>

                      <td className="py-5 text-gray-700">
                        {order.customer}
                      </td>

                      <td className="py-5 font-semibold">
                        {order.amount}
                      </td>

                      <td className="py-5">
                        <span className="px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold">
                          {order.status}
                        </span>
                      </td>

                      <td className="py-5">
                        <div className="flex gap-2 flex-wrap">
                          <button className="bg-black text-white px-3 py-2 rounded-xl text-sm font-semibold">
                            View
                          </button>

                          <button className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold">
                            Ship
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-6">

            {/* SHIPPING */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-5">
                Shipping Overview
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Shiprocket
                  </span>

                  <span className="font-bold text-green-600">
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Pending Pickup
                  </span>

                  <span className="font-bold text-gray-900">
                    24
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    RTO Risk
                  </span>

                  <span className="font-bold text-red-600">
                    5
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE ACTIVITY */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-5">
                Live Activity
              </h2>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-2" />

                  <div>
                    <div className="font-semibold text-gray-900">
                      Shipment Created
                    </div>

                    <div className="text-sm text-gray-500">
                      AWB generated successfully
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-2" />

                  <div>
                    <div className="font-semibold text-gray-900">
                      Payment Captured
                    </div>

                    <div className="text-sm text-gray-500">
                      Razorpay payment verified
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mt-2" />

                  <div>
                    <div className="font-semibold text-gray-900">
                      Pickup Scheduled
                    </div>

                    <div className="text-sm text-gray-500">
                      Courier assigned pickup slot
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI PANEL */}
            <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-2xl font-black mb-4">
                AI Fulfillment Assistant
              </h2>

              <p className="text-gray-300 text-sm leading-7">
                12 shipments are predicted to delay due to courier overload.
                Recommend switching to BlueDart Air for South India routes.
              </p>

              <button className="mt-5 bg-white text-black px-5 py-3 rounded-2xl font-bold">
                Optimize Shipments
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
