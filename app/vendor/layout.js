import VendorShell from "@/components/VendorShell";

export const metadata = {
  title: "Native Vendors", manifest: "/vendor-manifest.json",
  appleWebApp: { capable: true, title: "Native Vendors", statusBarStyle: "default" },
};

export default function VendorLayout({ children }) {
  return <VendorShell>{children}</VendorShell>;
}
