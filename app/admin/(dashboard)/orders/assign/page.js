"use client";
import { useEffect, useState } from "react";

export default function AssignOrders() {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [selectedStore, setSelectedStore] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [ordersRes, usersRes, warehousesRes] = await Promise.all([
        fetch("/api/admin/order"),
        fetch("/api/admin/users"),
        fetch("/api/admin/warehouses")
      ]);

      const ordersJson = await ordersRes.json();
      const usersJson = await usersRes.json();
      const warehousesJson = await warehousesRes.json();

      setOrders(ordersJson.orders || []);
      setStores(usersJson.filter(u => u.role === "store"));
      setWarehouses(warehousesJson || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
    setLoading(false);
  }

  async function loadInventory(warehouseId) {
    if (!warehouseId) return setInventory([]);
    try {
      const res = await fetch("/api/admin/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warehouseId })
      });
      const json = await res.json();
      setInventory(json.inventory || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAssign(orderId) {
    if (!selectedStore || !selectedWarehouse) return alert("Select store and warehouse");
    setAssigning(true);
    try {
      const res = await fetch("/api/admin/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, storeId: selectedStore, warehouseId: selectedWarehouse })
      });
      const json = await res.json();
      if (json.success) {
        alert("Order assigned successfully");
        loadData();
      } else {
        alert(json.message || "Failed to assign order");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setAssigning(false);
  }

  if (loading) return <h2 style={{ padding: 40 }}>Loading...</h2>;

  return (
    <div style={{ maxWidth: 1200, margin: "auto", padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Assign Orders to Stores & Warehouses</h1>
      {orders.length === 0 && <p>No unassigned orders found.</p>}

      {orders.map(order => (
        <div key={order._id} style={{ border: "1px solid #eee", padding: 15, marginTop: 15, borderRadius: 10 }}>
          <p><strong>Order ID:</strong> {order.orderId}</p>
          <p><strong>Status:</strong> {order.status}</p>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <select onChange={e => {
              setSelectedStore(e.target.value);
              const store = stores.find(s => s._id === e.target.value);
              setSelectedWarehouse(store?.warehouseId || "");
              loadInventory(store?.warehouseId);
            }}>
              <option value="">-- Select Store --</option>
              {stores.map(s => (
                <option key={s._id} value={s._id}>{s.name} {s.warehouseName ? `(${s.warehouseName})` : ""}</option>
              ))}
            </select>

            <select value={selectedWarehouse} onChange={e => { setSelectedWarehouse(e.target.value); loadInventory(e.target.value); }}>
              <option value="">-- Select Warehouse --</option>
              {warehouses.map(w => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>

            <button disabled={assigning} onClick={() => handleAssign(order._id)} style={{ padding: "6px 12px", background: "#1e40af", color: "#fff", border: "none", borderRadius: 6 }}>
              Assign
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <strong>Warehouse Inventory:</strong>
            <ul>
              {inventory.map(item => (
                <li key={item._id}>{item.skuId?.name || "SKU"}: {item.qty}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
