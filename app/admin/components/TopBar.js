"use client";

export default function TopBar() {
  return (
    <div className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">Admin Panel</h1>

      <div className="flex gap-6 text-sm">
        <span className="cursor-pointer">Dashboard</span>
        <span className="cursor-pointer font-semibold">Products</span>
        <span className="cursor-pointer">Orders</span>
      </div>
    </div>
  );
}
