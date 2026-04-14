export const roleMenus = {
  super_admin: [
    { name: "Dashboard", path: "/super-admin" },
    { name: "Users", path: "/super-admin/users" },
    { name: "All Inventory", path: "/admin/products" },
    { name: "Reports", path: "/analytics" },
  ],

  admin: [
    { name: "Dashboard", path: "/admin" },
    { name: "All Inventory", path: "/admin/products" },
    { name: "Orders", path: "/admin/orders" },
  ],

  vendor: [
    { name: "Dashboard", path: "/vendor" },
    { name: "My Inventory", path: "/vendor/products" },
    { name: "Orders", path: "/vendor/orders" },
    { name: "Dispatch", path: "/vendor/dispatch" },
  ],

  customer_support: [
    { name: "Dashboard", path: "/support" },
    { name: "Tickets", path: "/support/tickets" },
    { name: "Orders", path: "/support/orders" },
  ],

  finance: [
    { name: "Dashboard", path: "/finance" },
    { name: "Payments", path: "/finance/payments" },
  ],

  branding: [
    { name: "Dashboard", path: "/branding" },
    { name: "Labels", path: "/branding/labels" },
  ],

  analytics: [
    { name: "Dashboard", path: "/analytics" },
    { name: "Reports", path: "/analytics/reports" },
  ],

  customer: [
    { name: "Home", path: "/" },
    { name: "My Orders", path: "/account/orders" },
  ],
};
